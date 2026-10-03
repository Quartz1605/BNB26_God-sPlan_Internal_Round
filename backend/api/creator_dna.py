import os
import json
import logging
import httpx
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from bson import ObjectId

from database import client
from auth.router import get_current_user
from api.schemas import CreatorDNARequest, CreatorDNAResponse

logger = logging.getLogger("creatorai.creator_dna")

router = APIRouter(prefix="/creator/dna", tags=["creator-dna"])

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1/chat/completions")
MODEL = os.environ.get("AI_MODEL", "google/gemini-2.5-flash-lite")

SYSTEM_PROMPT_DNA = """You are an expert content strategist and AI behavioral analyst.
Your job is to analyze the extracted insights, summaries, and transcripts from a creator's existing videos to build their "Creator DNA".

The Creator DNA should capture who this creator is, their style, recurring topics, hook patterns, storytelling techniques, and unique strengths.
Do NOT simply summarize each video sequentially. Identify PATTERNS across all the provided content.

You MUST return ONLY valid JSON matching this exact structure:
{
  "identity": {
    "primary_topics": ["topic1", "topic2"],
    "secondary_topics": ["topic3"],
    "content_categories": ["category1"]
  },
  "communication": {
    "tone": ["confident", "casual"],
    "style": ["direct", "educational"],
    "formality": "casual",
    "sentence_style": ["short", "punchy"],
    "vocabulary_patterns": ["tech jargon", "accessible"],
    "language": ["English"]
  },
  "hooks": {
    "dominant_types": ["curiosity", "contrarian"],
    "patterns": ["Starts with a bold claim", "Asks a direct question"],
    "examples": [
      {
        "pattern": "Curiosity-driven hooks",
        "confidence": 0.85,
        "evidence": "Uses phrases like 'What if I told you...'"
      }
    ]
  },
  "storytelling": {
    "patterns": ["Problem -> Experience -> Insight"],
    "structure": ["Fast opening", "Deep dive body", "Quick outro"],
    "opening_style": ["Direct problem statement"],
    "ending_style": ["Soft CTA"]
  },
  "pacing": {
    "opening_pace": "Fast",
    "overall_pace": "Medium",
    "typical_clip_length": 45
  },
  "engagement": {
    "cta_patterns": ["Ask for comments", "Direct to link in bio"],
    "audience_questions": ["What do you think?"],
    "recurring_engagement_devices": ["Visual lists on screen"]
  },
  "content_patterns": {
    "recurring_topics": ["AI tools", "Career growth"],
    "recurring_formats": ["Talking head", "Screen recording tutorial"],
    "recurring_angles": ["Contrarian take on popular advice"]
  },
  "strengths": ["Breaking down complex topics simply", "High energy delivery"],
  "content_gaps": ["Lacks deep technical dives", "Could use more storytelling"],
  "representative_examples": [
    {
      "title": "Example",
      "reason": "Why this represents their style well"
    }
  ]
}
"""

def get_db():
    return client.get_default_database()

async def _extract_json_from_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("{"):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

    import re
    json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError("Could not extract valid JSON from AI response")

async def _run_creator_dna_analysis(user_id: str, asset_ids: List[str], dna_record_id: str):
    db = get_db()
    try:
        # Update status
        await db.creator_dna.update_one(
            {"_id": ObjectId(dna_record_id)},
            {"$set": {"status": "processing", "analysis_metadata.videos_analyzed": len(asset_ids)}}
        )

        # 1. Fetch analysis results for all selected assets
        assets_data = []
        for aid in asset_ids:
            asset = await db.assets.find_one({"_id": ObjectId(aid), "user_id": user_id})
            if asset and asset.get("analysis_status") == "completed" and "analysis" in asset:
                assets_data.append({
                    "filename": asset.get("filename"),
                    "summary": asset["analysis"].get("video_summary", ""),
                    "topics": asset["analysis"].get("topics", []),
                    "transcript_sample": asset["analysis"].get("transcript", "")[:2000], # Send first 2000 chars to save tokens
                    "clips": [c.get("title") for c in asset.get("clip_candidates", [])[:3]]
                })

        if not assets_data:
            raise Exception("No valid completed analysis found for selected assets.")

        # 2. Synthesize with AI
        user_prompt = "Analyze the following videos and extract the Creator DNA.\n\n"
        for i, data in enumerate(assets_data):
            user_prompt += f"--- Video {i+1} ({data['filename']}) ---\n"
            user_prompt += f"Summary: {data['summary']}\n"
            user_prompt += f"Topics: {', '.join(data['topics'])}\n"
            user_prompt += f"Clip Hooks: {', '.join(data['clips'])}\n"
            user_prompt += f"Transcript Sample:\n{data['transcript_sample']}\n\n"

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "CreatorAI"
        }

        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_DNA},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.4,
            "max_tokens": 4096
        }

        async with httpx.AsyncClient(timeout=120.0) as http_client:
            response = await http_client.post(OPENROUTER_BASE_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            dna_data = await _extract_json_from_response(content)

        # 3. Save to MongoDB
        update_doc = {
            "status": "completed",
            "updated_at": datetime.now(timezone.utc),
            "identity": dna_data.get("identity", {}),
            "communication": dna_data.get("communication", {}),
            "hooks": dna_data.get("hooks", {}),
            "storytelling": dna_data.get("storytelling", {}),
            "pacing": dna_data.get("pacing", {}),
            "engagement": dna_data.get("engagement", {}),
            "content_patterns": dna_data.get("content_patterns", {}),
            "strengths": dna_data.get("strengths", []),
            "content_gaps": dna_data.get("content_gaps", []),
            "representative_examples": dna_data.get("representative_examples", []),
            "analysis_metadata.last_analyzed_at": datetime.now(timezone.utc)
        }

        await db.creator_dna.update_one(
            {"_id": ObjectId(dna_record_id)},
            {"$set": update_doc}
        )
        logger.info(f"[CREATOR_DNA] Analysis completed for user={user_id}")

    except Exception as e:
        logger.error(f"[CREATOR_DNA] Analysis failed for user={user_id}: {str(e)}")
        await db.creator_dna.update_one(
            {"_id": ObjectId(dna_record_id)},
            {"$set": {"status": "failed", "error": str(e), "updated_at": datetime.now(timezone.utc)}}
        )

@router.post("/analyze")
async def analyze_creator_dna(
    request: CreatorDNARequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    user_id = str(user["_id"])
    if not request.asset_ids:
        raise HTTPException(status_code=400, detail="Must provide at least one asset ID")

    db = get_db()
    
    # Verify assets exist and belong to user
    for aid in request.asset_ids:
        try:
            asset = await db.assets.find_one({"_id": ObjectId(aid), "user_id": user_id})
            if not asset:
                raise HTTPException(status_code=404, detail=f"Asset {aid} not found")
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid asset ID {aid}")

    # Check for existing DNA record to increment version, or create new
    existing = await db.creator_dna.find_one({"user_id": user_id})
    version = (existing["version"] + 1) if existing else 1

    new_dna = {
        "user_id": user_id,
        "version": version,
        "status": "queued",
        "source_asset_ids": request.asset_ids,
        "identity": {},
        "communication": {},
        "hooks": {},
        "storytelling": {},
        "pacing": {},
        "engagement": {},
        "content_patterns": {},
        "strengths": [],
        "content_gaps": [],
        "representative_examples": [],
        "analysis_metadata": {
            "videos_analyzed": 0,
            "last_analyzed_at": None
        },
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    if existing:
        await db.creator_dna.update_one({"_id": existing["_id"]}, {"$set": new_dna})
        dna_record_id = str(existing["_id"])
    else:
        result = await db.creator_dna.insert_one(new_dna)
        dna_record_id = str(result.inserted_id)

    background_tasks.add_task(_run_creator_dna_analysis, user_id, request.asset_ids, dna_record_id)

    return {"message": "Creator DNA analysis started", "status": "processing"}

@router.get("", response_model=Optional[CreatorDNAResponse])
async def get_creator_dna(user: dict = Depends(get_current_user)):
    db = get_db()
    dna = await db.creator_dna.find_one({"user_id": str(user["_id"])})
    if not dna:
        return None
        
    dna["_id"] = str(dna["_id"])
    return dna

SYSTEM_PROMPT_OPPORTUNITIES = """You are an expert content strategist.
Given a Creator's DNA and a brief summary of their historical content, your job is to identify new content opportunities that they should explore next.

Identify opportunities based on:
- Topic gaps (things they haven't covered but fit their audience)
- Topic combinations (e.g., AI x Career)
- Underused strengths or formats

Do NOT use language like "this will go viral". Use language like "Creator DNA Match", "Topic Opportunity", etc.

You MUST return ONLY valid JSON matching this exact structure:
{
  "opportunities": [
    {
      "title": "Short catchy title of the concept",
      "concept": "A 1-2 sentence description of the idea",
      "why_this_fits": "Explanation of why this matches their Creator DNA",
      "creator_dna_match": 0.88,
      "supporting_patterns": ["Pattern 1", "Pattern 2"],
      "suggested_hook": "Example opening line",
      "suggested_format": "e.g., 60-second myth vs reality",
      "target_topic": "Primary topic",
      "confidence": 0.82
    }
  ]
}
Return at least 3 distinct opportunities.
"""

async def _run_opportunity_generation(user_id: str, dna: dict, record_id: str):
    db = get_db()
    try:
        await db.content_opportunities.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "processing"}}
        )

        user_prompt = "Generate content opportunities based on this Creator DNA:\n\n"
        user_prompt += json.dumps(dna, indent=2, default=str)

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "CreatorAI"
        }

        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_OPPORTUNITIES},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.5,
            "max_tokens": 4096
        }

        async with httpx.AsyncClient(timeout=120.0) as http_client:
            response = await http_client.post(OPENROUTER_BASE_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            opps_data = await _extract_json_from_response(content)

        update_doc = {
            "status": "completed",
            "opportunities": opps_data.get("opportunities", []),
            "generated_at": datetime.now(timezone.utc)
        }

        await db.content_opportunities.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": update_doc}
        )
        logger.info(f"[CONTENT_OPPORTUNITY] Generation completed for user={user_id}")

    except Exception as e:
        logger.error(f"[CONTENT_OPPORTUNITY] Generation failed for user={user_id}: {str(e)}")
        await db.content_opportunities.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"status": "failed", "error": str(e), "generated_at": datetime.now(timezone.utc)}}
        )

@router.post("/opportunities/generate")
async def generate_opportunities(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    user_id = str(user["_id"])
    db = get_db()
    
    dna = await db.creator_dna.find_one({"user_id": user_id, "status": "completed"})
    if not dna:
        raise HTTPException(status_code=400, detail="Must have a completed Creator DNA to generate opportunities")

    # Clean DNA for prompt
    dna_clean = {k: v for k, v in dna.items() if k not in ["_id", "user_id", "status", "version", "created_at", "updated_at"]}

    existing = await db.content_opportunities.find_one({"user_id": user_id})

    new_opps = {
        "user_id": user_id,
        "status": "queued",
        "opportunities": [],
        "generated_at": datetime.now(timezone.utc)
    }

    if existing:
        await db.content_opportunities.update_one({"_id": existing["_id"]}, {"$set": new_opps})
        record_id = str(existing["_id"])
    else:
        result = await db.content_opportunities.insert_one(new_opps)
        record_id = str(result.inserted_id)

    background_tasks.add_task(_run_opportunity_generation, user_id, dna_clean, record_id)

    return {"message": "Opportunity generation started", "status": "processing"}

@router.get("/opportunities")
async def get_opportunities(user: dict = Depends(get_current_user)):
    db = get_db()
    opps = await db.content_opportunities.find_one({"user_id": str(user["_id"])})
    if not opps:
        return None
        
    opps["_id"] = str(opps["_id"])
    return opps

