"""
AI service for video analysis using Gemini via OpenRouter.
Cost-optimized multi-stage pipeline:
1. Transcript-first analysis
2. Optional visual verification
"""

import os
import json
import httpx
import logging
import re
from typing import Optional, List, Dict, Any

logger = logging.getLogger("creatorai.ai")

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1/chat/completions")
MODEL = os.environ.get("AI_MODEL", "google/gemini-2.5-flash-lite")
AI_MAX_RETRIES = int(os.environ.get("AI_MAX_RETRIES", "1"))

SYSTEM_PROMPT_TRANSCRIPT = """You are an expert short-form video editor and content strategist.

Your job is to analyze the supplied timestamped transcript and identify sections that can become strong standalone short-form clips.

A strong clip should ideally:
- have a strong opening/hook
- communicate one coherent idea
- be understandable without watching the entire source video
- contain useful, interesting, emotional, surprising, educational, or entertaining content
- have a natural beginning and ending
- avoid unnecessary introductions
- avoid long pauses
- avoid incomplete sentences
- avoid references that require substantial missing context
- preferably be suitable for TikTok/Reels/YouTube Shorts
- generally be between 15 and 60 seconds

You MUST NOT invent timestamps. Every timestamp must originate from the transcript segment timestamps provided.
If a desired clip begins in the middle of a transcript segment, use the closest sensible timestamp from the transcript.
Prefer natural sentence boundaries.

IMPORTANT SCORING RUBRIC — score each candidate on these dimensions (0-10):
- hook: How strong is the opening? Does it grab attention?
- clarity: Can the clip stand alone without extra context?
- value: How much useful/interesting information does it contain?
- entertainment: How engaging, emotional, or entertaining is it?
- pacing: Is the pacing tight and appropriate for short-form?

(Do not score visual_interest here as you are only reading the transcript. Default it to 0).

Calculate overall_score as the average of the scores you do provide.

Return ONLY valid JSON matching this exact structure:
{
  "video_summary": "A 2-3 sentence summary of what the video is about based on the transcript",
  "topics": ["topic1", "topic2", "topic3"],
  "clip_candidates": [
    {
      "candidate_id": "candidate_1",
      "start": 0.0,
      "end": 0.0,
      "title": "Short catchy title for this clip",
      "hook": "The opening line or hook of this clip",
      "summary": "What happens in this clip",
      "reason": "Why this is a strong clip candidate",
      "scores": {
        "hook": 0,
        "clarity": 0,
        "value": 0,
        "entertainment": 0,
        "visual_interest": 0,
        "pacing": 0
      },
      "overall_score": 0.0
    }
  ]
}"""

SYSTEM_PROMPT_VISION = """You are an expert short-form video editor reviewing a candidate clip for visual quality.
I will provide a series of low-resolution frame samples from the clip, along with its transcript.

Evaluate the visual quality:
- scene consistency
- demonstrations
- screen content
- whether the visual content complements the transcript
- whether the candidate actually looks like a good short-form clip

Provide a visual_interest score (0-10) and an updated overall_score.
Return ONLY valid JSON:
{
  "visual_interest": 8,
  "visual_reasoning": "Why it got this score",
  "overall_score": 7.5
}"""


def record_ai_usage(operation: str, input_tokens: int, output_tokens: int, model: str = MODEL):
    """Log AI usage for cost observability."""
    # Approximate costs for gemini-2.5-flash-lite on OpenRouter
    cost_per_1k_input = 0.000075
    cost_per_1k_output = 0.0003
    
    est_cost = (input_tokens / 1000.0) * cost_per_1k_input + (output_tokens / 1000.0) * cost_per_1k_output
    
    usage = {
        "provider": "openrouter",
        "model": model,
        "operation": operation,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "estimated_cost_usd": est_cost
    }
    logger.info(f"[AI_COST] {json.dumps(usage)}")


def _extract_json_from_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("{"):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

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


def _validate_and_fix_candidates(analysis: dict, video_duration: float) -> dict:
    validated_candidates = []

    for candidate in analysis.get("clip_candidates", []):
        start = candidate.get("start", 0)
        end = candidate.get("end", 0)

        try:
            start = float(start)
            end = float(end)
        except (ValueError, TypeError):
            continue

        start = max(0.0, min(start, video_duration))
        end = max(0.0, min(end, video_duration))

        if start >= end:
            continue

        clip_duration = end - start
        if clip_duration < 5 or clip_duration > 120:
            continue

        scores = candidate.get("scores", {})
        for key in ["hook", "clarity", "value", "entertainment", "visual_interest", "pacing"]:
            try:
                scores[key] = max(0, min(10, float(scores.get(key, 5))))
            except (ValueError, TypeError):
                scores[key] = 5.0

        score_values = [scores[k] for k in ["hook", "clarity", "value", "entertainment", "pacing"]]
        overall_score = round(sum(score_values) / len(score_values), 1)

        candidate["start"] = round(start, 1)
        candidate["end"] = round(end, 1)
        candidate["scores"] = scores
        candidate["overall_score"] = overall_score
        candidate["duration"] = round(clip_duration, 1)
        candidate["status"] = "candidate"

        validated_candidates.append(candidate)

    # Deduplicate overlapping clips
    filtered = []
    for candidate in validated_candidates:
        is_duplicate = False
        for existing in filtered:
            overlap_start = max(candidate["start"], existing["start"])
            overlap_end = min(candidate["end"], existing["end"])
            if overlap_end > overlap_start:
                overlap_duration = overlap_end - overlap_start
                shorter_duration = min(candidate["duration"], existing["duration"])
                if shorter_duration > 0 and (overlap_duration / shorter_duration) > 0.7:
                    is_duplicate = True
                    break
        if not is_duplicate:
            filtered.append(candidate)

    filtered.sort(key=lambda c: c.get("overall_score", 0), reverse=True)
    for i, candidate in enumerate(filtered):
        candidate["candidate_id"] = f"candidate_{i + 1}"

    analysis["clip_candidates"] = filtered
    return analysis


async def analyze_transcript_with_ai(
    transcript: str,
    video_duration: float
) -> dict:
    """Analyze a timestamped transcript to find clip candidates."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not configured")

    num_candidates = 5 if video_duration >= 180 else (3 if video_duration >= 60 else 2)
    
    user_prompt = f"Video duration: {video_duration} seconds.\nIdentify the {num_candidates} best clip candidates.\n\nTranscript:\n{transcript}"

    last_error = None
    for attempt in range(1, AI_MAX_RETRIES + 1):
        try:
            logger.info(f"[VIDEO_ANALYSIS] Transcript analysis attempt {attempt}/{AI_MAX_RETRIES}")
            
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "CreatorAI"
            }

            payload = {
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT_TRANSCRIPT},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 4096
            }

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(OPENROUTER_BASE_URL, headers=headers, json=payload)

                if response.status_code != 200:
                    logger.error(f"[VIDEO_ANALYSIS] API error ({response.status_code}): {response.text}")
                    last_error = f"AI API error {response.status_code}"
                    continue

                result = response.json()
                
                # Usage logging
                usage = result.get("usage", {})
                if usage:
                    record_ai_usage("transcript_analysis", usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0))

                content = result["choices"][0]["message"]["content"]
                analysis = _extract_json_from_response(content)

                if "clip_candidates" not in analysis:
                    last_error = "Missing clip_candidates"
                    continue

                analysis = _validate_and_fix_candidates(analysis, video_duration)
                if not analysis["clip_candidates"]:
                    last_error = "No valid candidates after validation"
                    continue

                return analysis

        except Exception as e:
            last_error = str(e)
            logger.error(f"[VIDEO_ANALYSIS] Error on attempt {attempt}: {e}")

    raise Exception(f"Transcript analysis failed after {AI_MAX_RETRIES} attempts. Last error: {last_error}")


import base64
def _encode_image(path: str) -> str:
    with open(path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


async def verify_clip_visually_with_ai(candidate: dict, frame_paths: List[str]) -> dict:
    """Send low-res frames to Gemini to score visual quality."""
    if not OPENROUTER_API_KEY or not frame_paths:
        return candidate
        
    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "CreatorAI"
        }
        
        user_content = [{"type": "text", "text": f"Candidate: {candidate['title']}\nSummary: {candidate['summary']}\nEvaluate these frames."}]
        for path in frame_paths:
            base64_img = _encode_image(path)
            user_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}
            })
            
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_VISION},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.2,
            "max_tokens": 1000
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(OPENROUTER_BASE_URL, headers=headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                usage = result.get("usage", {})
                if usage:
                    record_ai_usage("visual_verification", usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0))
                    
                content = result["choices"][0]["message"]["content"]
                verification = _extract_json_from_response(content)
                
                if "visual_interest" in verification:
                    candidate["scores"]["visual_interest"] = verification["visual_interest"]
                    candidate["visual_reasoning"] = verification.get("visual_reasoning", "")
                    candidate["overall_score"] = verification.get("overall_score", candidate["overall_score"])
                    
        return candidate
    except Exception as e:
        logger.error(f"[VIDEO_ANALYSIS] Visual verification failed: {e}")
        return candidate
