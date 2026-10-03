"""
Video Analysis API — AI-powered video understanding and clip generation.

Endpoints:
  POST /projects/{project_id}/assets/{asset_id}/analyze  — Start analysis
  GET  /projects/{project_id}/assets/{asset_id}/analysis  — Get analysis results
  POST /projects/{project_id}/assets/{asset_id}/clips     — Generate a clip
  GET  /projects/{project_id}/assets/{asset_id}/clips      — Get generated clips
  GET  /projects/{project_id}/assets/{asset_id}/presigned-url — Get presigned URL
"""

import os
import asyncio
import tempfile
import shutil
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import List

from database import client
from auth.router import get_current_user
from api.ffmpeg_service import get_video_metadata, render_clip
from api.ai_service import analyze_transcript_with_ai, verify_clip_visually_with_ai

import boto3

logger = logging.getLogger("creatorai.video_analysis")

router = APIRouter(prefix="/projects", tags=["video-analysis"])

# Reuse existing S3 config
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name=os.environ.get('AWS_REGION', 'eu-north-1')
)
AWS_BUCKET_NAME = os.environ.get('AWS_BUCKET_NAME', 'godsplan-creatorai')

# Temp directory for video processing
TEMP_DIR = os.path.join(tempfile.gettempdir(), "creatorai")
os.makedirs(TEMP_DIR, exist_ok=True)


def get_db():
    return client.get_default_database()


# ─── Pydantic Models ────────────────────────────────────────────

class ClipScores(BaseModel):
    hook: float = 0
    clarity: float = 0
    value: float = 0
    entertainment: float = 0
    visual_interest: float = 0
    pacing: float = 0

class ClipCandidate(BaseModel):
    candidate_id: str
    start: float
    end: float
    duration: float = 0
    title: str = ""
    hook: str = ""
    summary: str = ""
    reason: str = ""
    scores: ClipScores = ClipScores()
    overall_score: float = 0
    status: str = "candidate"

class AnalysisResponse(BaseModel):
    status: str
    progress: int = 0
    video_summary: str = ""
    topics: List[str] = []
    clip_candidates: List[ClipCandidate] = []
    video_metadata: dict = {}
    error: Optional[str] = None

class ClipCreateRequest(BaseModel):
    candidate_id: Optional[str] = None
    start: Optional[float] = None
    end: Optional[float] = None
    title: Optional[str] = "Untitled Clip"

class GeneratedClipResponse(BaseModel):
    id: str = Field(alias="_id")
    project_id: str
    user_id: str
    filename: str
    asset_type: str
    file_size: int
    file_url: str
    status: str
    created_at: datetime
    parent_asset_id: str = ""
    source_start: float = 0
    source_end: float = 0
    duration: float = 0
    clip_title: str = ""

    class Config:
        populate_by_name = True


# ─── Helper Functions ─────────────────────────────────────────

async def _verify_asset_ownership(project_id: str, asset_id: str, user_id: str):
    """Verify the user owns both the project and asset."""
    db = get_db()

    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": user_id
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    asset = await db.assets.find_one({
        "_id": ObjectId(asset_id),
        "project_id": project_id,
        "user_id": user_id
    })
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    return project, asset


def _get_s3_key_from_url(file_url: str) -> str:
    """Extract the S3 key from the stored file URL or reconstruct from fields."""
    # The presigned URL contains the key after the bucket name
    # e.g., https://bucket.s3.region.amazonaws.com/creatorai/userId/projectId/file.mp4?...
    from urllib.parse import urlparse, unquote
    parsed = urlparse(file_url)
    path = unquote(parsed.path).lstrip("/")
    return path


def _generate_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    """Generate a temporary presigned GET URL for an S3 object."""
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': AWS_BUCKET_NAME, 'Key': s3_key},
        ExpiresIn=expires_in
    )


def _reconstruct_s3_key(user_id: str, project_id: str, filename: str) -> str:
    """Reconstruct S3 key from known components following existing convention."""
    return f"creatorai/{user_id}/{project_id}/{filename}"


# ─── Background Analysis Task ──────────────────────────────────

async def _run_analysis(asset_id: str, project_id: str, user_id: str):
    """Background task: Download video, extract metadata, run AI analysis."""
    db = get_db()
    temp_video_path = None

    try:
        # Update status to processing
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {
                "analysis_status": "processing",
                "analysis_progress": 10,
                "analysis_step": "Loading video"
            }}
        )

        # Get asset from DB
        asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
        if not asset:
            raise Exception("Asset not found")

        # Reconstruct S3 key from stored metadata
        s3_key = _reconstruct_s3_key(user_id, project_id, asset["filename"])

        logger.info(f"[VIDEO_ANALYSIS] Started. asset={asset_id}, s3_key={s3_key}")

        # Update progress
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {"analysis_progress": 20, "analysis_step": "Downloading from S3"}}
        )

        # Download video from S3 to temp file
        temp_video_path = os.path.join(TEMP_DIR, f"{asset_id}_{asset['filename']}")
        s3_client.download_file(AWS_BUCKET_NAME, s3_key, temp_video_path)
        logger.info(f"[VIDEO_ANALYSIS] Downloaded to {temp_video_path}")

        # Update progress
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {"analysis_progress": 30, "analysis_step": "Extracting metadata"}}
        )

        # Extract video metadata
        metadata = await get_video_metadata(temp_video_path)
        logger.info(f"[VIDEO_ANALYSIS] Metadata: {metadata}")

        # Save metadata to asset
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {
                "video_metadata": metadata,
                "analysis_progress": 35,
                "analysis_step": "Extracting audio"
            }}
        )

        from api.ffmpeg_service import extract_audio_for_transcription, extract_frames_for_clip
        temp_audio_path = os.path.join(TEMP_DIR, f"{asset_id}_audio.wav")
        await extract_audio_for_transcription(temp_video_path, temp_audio_path)

        # Update progress
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {"analysis_progress": 45, "analysis_step": "Transcribing speech"}}
        )
        
        from api.transcription_service import transcription_service
        transcript_result = await transcription_service.transcribe(temp_audio_path)
        compact_transcript = transcript_result.to_compact_text()

        # Update progress
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {"analysis_progress": 60, "analysis_step": "Analyzing transcript"}}
        )

        from api.ai_service import analyze_transcript_with_ai, verify_clip_visually_with_ai
        analysis = await analyze_transcript_with_ai(
            transcript=compact_transcript,
            video_duration=metadata["duration"]
        )

        enable_visual = os.environ.get("ENABLE_VISUAL_VERIFICATION", "true").lower() == "true"
        if enable_visual and analysis.get("clip_candidates"):
            await db.assets.update_one(
                {"_id": ObjectId(asset_id)},
                {"$set": {"analysis_progress": 80, "analysis_step": "Visual verification"}}
            )
            interval = int(os.environ.get("VISUAL_SAMPLE_INTERVAL", "3"))
            width = int(os.environ.get("VISUAL_FRAME_WIDTH", "640"))
            
            verified_candidates = []
            for c in analysis["clip_candidates"]:
                frames = await extract_frames_for_clip(temp_video_path, c["start"], c["end"], interval, width, TEMP_DIR)
                verified = await verify_clip_visually_with_ai(c, frames)
                verified_candidates.append(verified)
                
                # Cleanup frames
                for f in frames:
                    try:
                        os.remove(f)
                    except OSError:
                        pass
            
            # Re-sort after visual verification might have changed scores
            verified_candidates.sort(key=lambda c: c.get("overall_score", 0), reverse=True)
            analysis["clip_candidates"] = verified_candidates

        # Update progress
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {"analysis_progress": 95, "analysis_step": "Saving results"}}
        )

        # Store analysis results
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {
                "analysis_status": "completed",
                "analysis_progress": 100,
                "analysis_step": "Complete",
                "analysis": {
                    "video_summary": analysis.get("video_summary", ""),
                    "topics": analysis.get("topics", []),
                    "transcript": compact_transcript
                },
                "clip_candidates": analysis.get("clip_candidates", []),
                "analyzed_at": datetime.now(timezone.utc)
            }}
        )

        logger.info(f"[VIDEO_ANALYSIS] Completed. asset={asset_id}, "
                    f"candidates={len(analysis.get('clip_candidates', []))}")

    except Exception as e:
        logger.error(f"[VIDEO_ANALYSIS] Failed. asset={asset_id}, error={str(e)}")
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$set": {
                "analysis_status": "failed",
                "analysis_progress": 0,
                "analysis_step": "Failed",
                "analysis_error": str(e)
            }}
        )
    finally:
        # Cleanup temp file
        if temp_video_path and os.path.exists(temp_video_path):
            try:
                os.remove(temp_video_path)
                logger.info(f"[VIDEO_ANALYSIS] Cleaned up temp file: {temp_video_path}")
            except OSError:
                pass


# ─── API Endpoints ──────────────────────────────────────────────

@router.get("/{project_id}/assets/{asset_id}/presigned-url")
async def get_presigned_url(
    project_id: str,
    asset_id: str,
    user: dict = Depends(get_current_user)
):
    """Get a fresh presigned URL for a video asset (for preview playback)."""
    _, asset = await _verify_asset_ownership(project_id, asset_id, str(user["_id"]))
    s3_key = _reconstruct_s3_key(str(user["_id"]), project_id, asset["filename"])
    url = _generate_presigned_url(s3_key, expires_in=3600)
    return {"url": url}


@router.post("/{project_id}/assets/{asset_id}/analyze")
async def start_analysis(
    project_id: str,
    asset_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Start AI video analysis for an asset."""
    _, asset = await _verify_asset_ownership(project_id, asset_id, str(user["_id"]))

    # Check if asset is a video
    asset_type = asset.get("asset_type", "")
    if not asset_type.startswith("video"):
        raise HTTPException(status_code=400, detail="Only video assets can be analyzed")

    # Idempotency: if already processing, return current status
    current_status = asset.get("analysis_status")
    if current_status == "processing":
        return {
            "asset_id": asset_id,
            "status": "processing",
            "message": "Analysis is already in progress"
        }

    # If completed, allow re-analysis only if explicitly requested
    if current_status == "completed":
        # Reset for re-analysis
        logger.info(f"[VIDEO_ANALYSIS] Re-analysis requested for asset={asset_id}")

    # Mark as queued
    db = get_db()
    await db.assets.update_one(
        {"_id": ObjectId(asset_id)},
        {"$set": {
            "analysis_status": "processing",
            "analysis_progress": 5,
            "analysis_step": "Queued",
            "analysis_error": None
        }}
    )

    # Launch background task
    background_tasks.add_task(_run_analysis, asset_id, project_id, str(user["_id"]))

    logger.info(f"[VIDEO_ANALYSIS] Queued analysis for asset={asset_id}")

    return {
        "asset_id": asset_id,
        "status": "processing",
        "message": "Analysis started"
    }


@router.get("/{project_id}/assets/{asset_id}/analysis")
async def get_analysis(
    project_id: str,
    asset_id: str,
    user: dict = Depends(get_current_user)
):
    """Get the analysis results for a video asset."""
    _, asset = await _verify_asset_ownership(project_id, asset_id, str(user["_id"]))

    analysis_status = asset.get("analysis_status", "none")
    analysis = asset.get("analysis", {})
    candidates = asset.get("clip_candidates", [])
    metadata = asset.get("video_metadata", {})

    return {
        "status": analysis_status,
        "progress": asset.get("analysis_progress", 0),
        "step": asset.get("analysis_step", ""),
        "video_summary": analysis.get("video_summary", ""),
        "topics": analysis.get("topics", []),
        "clip_candidates": candidates,
        "video_metadata": metadata,
        "error": asset.get("analysis_error")
    }


@router.post("/{project_id}/assets/{asset_id}/clips")
async def generate_clip(
    project_id: str,
    asset_id: str,
    clip_request: ClipCreateRequest,
    user: dict = Depends(get_current_user)
):
    """Generate a clip from a video asset using FFmpeg."""
    _, asset = await _verify_asset_ownership(project_id, asset_id, str(user["_id"]))
    user_id = str(user["_id"])

    # Resolve start/end from candidate or from request body
    start = clip_request.start
    end = clip_request.end
    title = clip_request.title or "Untitled Clip"

    if clip_request.candidate_id:
        candidates = asset.get("clip_candidates", [])
        candidate = next(
            (c for c in candidates if c.get("candidate_id") == clip_request.candidate_id),
            None
        )
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        start = candidate.get("start")
        end = candidate.get("end")
        title = candidate.get("title", title)

    if start is None or end is None:
        raise HTTPException(status_code=400, detail="start and end timestamps are required")

    # Validate timestamps against video metadata
    metadata = asset.get("video_metadata", {})
    duration = metadata.get("duration", 0)

    if duration > 0:
        if start < 0 or end > duration or start >= end:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid timestamps: start={start}, end={end}, video_duration={duration}"
            )

    if end - start < 2:
        raise HTTPException(status_code=400, detail="Clip must be at least 2 seconds long")

    db = get_db()
    temp_source = None
    temp_output = None

    try:
        # Download source video from S3
        s3_key = _reconstruct_s3_key(user_id, project_id, asset["filename"])
        temp_source = os.path.join(TEMP_DIR, f"src_{asset_id}_{uuid.uuid4().hex[:8]}.mp4")
        temp_output = os.path.join(TEMP_DIR, f"clip_{asset_id}_{uuid.uuid4().hex[:8]}.mp4")

        logger.info(f"[CLIP_RENDER] Downloading source: {s3_key}")
        s3_client.download_file(AWS_BUCKET_NAME, s3_key, temp_source)

        # Render clip with FFmpeg
        logger.info(f"[CLIP_RENDER] Rendering: start={start}, end={end}")
        await render_clip(temp_source, temp_output, start, end)

        # Get output file size
        clip_file_size = os.path.getsize(temp_output)

        # Upload clip to S3 as a new asset
        clip_filename = f"clip_{uuid.uuid4().hex[:8]}.mp4"
        clip_s3_key = f"creatorai/{user_id}/{project_id}/clips/{clip_filename}"

        logger.info(f"[CLIP_RENDER] Uploading clip to S3: {clip_s3_key}")
        s3_client.upload_file(
            temp_output,
            AWS_BUCKET_NAME,
            clip_s3_key,
            ExtraArgs={'ContentType': 'video/mp4'}
        )

        # Generate presigned URL for the clip
        clip_url = _generate_presigned_url(clip_s3_key, expires_in=3600)

        # Save clip as a new asset in MongoDB
        new_clip_asset = {
            "project_id": project_id,
            "user_id": user_id,
            "filename": clip_filename,
            "asset_type": "video/mp4",
            "file_size": clip_file_size,
            "file_url": clip_url,
            "s3_key": clip_s3_key,
            "status": "completed",
            "created_at": datetime.now(timezone.utc),
            "parent_asset_id": asset_id,
            "source_start": round(start, 1),
            "source_end": round(end, 1),
            "duration": round(end - start, 1),
            "clip_title": title,
            "is_clip": True
        }

        result = await db.assets.insert_one(new_clip_asset)
        new_clip_asset["_id"] = str(result.inserted_id)

        logger.info(f"[CLIP_RENDER] Success. clip_id={new_clip_asset['_id']}, "
                    f"size={clip_file_size} bytes")

        return new_clip_asset

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CLIP_RENDER] Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Clip generation failed: {str(e)}")
    finally:
        # Cleanup temp files
        for path in [temp_source, temp_output]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass


@router.get("/{project_id}/assets/{asset_id}/clips")
async def get_generated_clips(
    project_id: str,
    asset_id: str,
    user: dict = Depends(get_current_user)
):
    """Get all generated clips for a source video asset."""
    await _verify_asset_ownership(project_id, asset_id, str(user["_id"]))

    db = get_db()
    cursor = db.assets.find({
        "parent_asset_id": asset_id,
        "project_id": project_id,
        "user_id": str(user["_id"]),
        "is_clip": True
    })
    clips = await cursor.to_list(length=100)

    # Refresh presigned URLs for clips
    for clip in clips:
        clip["_id"] = str(clip["_id"])
        s3_key = clip.get("s3_key")
        if s3_key:
            clip["file_url"] = _generate_presigned_url(s3_key, expires_in=3600)

    return clips
