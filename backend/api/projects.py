import os
import botocore
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from bson import ObjectId
import boto3
from botocore.exceptions import NoCredentialsError
from typing import List

from database import client
from auth.router import get_current_user
from .schemas import ProjectCreate, ProjectResponse, AssetResponse
import httpx
import json

from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/projects", tags=["projects"])

import botocore

# Configure S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"].strip(),
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"].strip(),
    region_name="eu-north-1",
    endpoint_url="https://s3.eu-north-1.amazonaws.com",
    config=botocore.client.Config(
        signature_version="s3v4",
        s3={
            "addressing_style": "virtual"
        }
    )
)
AWS_BUCKET_NAME = os.environ.get('AWS_BUCKET_NAME', 'godsplan-creatorai').strip()

def get_db():
    return client.get_default_database()

@router.post("", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    
    new_project = {
        "user_id": str(user["_id"]),
        "name": project.name,
        "description": project.description,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.projects.insert_one(new_project)
    new_project["_id"] = str(result.inserted_id)
    return new_project

@router.get("", response_model=List[ProjectResponse])
async def get_projects(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.projects.find({"user_id": str(user["_id"])})
    projects = await cursor.to_list(length=100)
    for p in projects:
        p["_id"] = str(p["_id"])
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project["_id"] = str(project["_id"])
    return project

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body

@router.patch("/{project_id}")
async def update_project(project_id: str, update_data: dict = Body(...), user: dict = Depends(get_current_user)):
    db = get_db()
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.projects.update_one(
        {"_id": ObjectId(project_id), "user_id": str(user["_id"])},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return {"message": "Project updated successfully"}

@router.delete("/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.projects.delete_one({"_id": ObjectId(project_id), "user_id": str(user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Also delete assets associated with this project
    # Normally we would delete files from Cloudinary too, but skipping for simplicity
    await db.assets.delete_many({"project_id": project_id, "user_id": str(user["_id"])})
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/assets", response_model=AssetResponse)
async def upload_asset(
    project_id: str,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    db = get_db()
    # Verify project belongs to user
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Upload to AWS S3
    temp_file_path = None
    try:
        import tempfile
        import shutil
        
        # Save to a temporary file first
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name

        # Construct S3 key
        s3_key = f"creatorai/{user['_id']}/{project_id}/{file.filename}"
        
        # Upload to S3
        s3_client.upload_file(
            temp_file_path,
            AWS_BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        # Generate S3 URL
        # For public buckets, you can construct the URL directly:
        # file_url = f"https://{AWS_BUCKET_NAME}.s3.{os.environ.get('AWS_REGION', 'eu-north-1')}.amazonaws.com/{s3_key}"
        # For private buckets, generate a presigned URL:
        file_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': AWS_BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=3600  # URL expires in 1 hour
        )
        
        # file_size can be extracted from the temporary file
        file_size = os.path.getsize(temp_file_path)
    except Exception as e:
        print(f"S3 upload error: {str(e)}") # Add logging for debug
        raise HTTPException(status_code=500, detail=f"Failed to upload to S3: {str(e)}")
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
    new_asset = {
        "project_id": project_id,
        "user_id": str(user["_id"]),
        "filename": file.filename,
        "asset_type": file.content_type or "application/octet-stream",
        "file_size": file_size,
        "file_url": file_url,
        "status": "completed",
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.assets.insert_one(new_asset)
    new_asset["_id"] = str(result.inserted_id)
    
    return new_asset

@router.get("/{project_id}/assets", response_model=List[AssetResponse])
async def get_project_assets(project_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    # Verify project belongs to user
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    cursor = db.assets.find({"project_id": project_id, "user_id": str(user["_id"])})
    assets = await cursor.to_list(length=100)
    
    for a in assets:
        a["_id"] = str(a["_id"])
        
        # Regenerate fresh presigned URL to prevent expiration
        s3_key = f"creatorai/{user['_id']}/{project_id}/{a['filename']}"
        try:
            fresh_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': AWS_BUCKET_NAME, 'Key': s3_key},
                ExpiresIn=3600
            )
            a["file_url"] = fresh_url
        except Exception as e:
            print(f"Failed to regenerate presigned URL for {a['filename']}: {e}")
            
    return assets

@router.delete("/{project_id}/assets/{asset_id}")
async def delete_asset(project_id: str, asset_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.assets.delete_one({
        "_id": ObjectId(asset_id), 
        "project_id": project_id,
        "user_id": str(user["_id"])
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset deleted successfully"}

@router.post("/{project_id}/export")
async def export_project(
    project_id: str,
    payload: dict = Body(None),
    user: dict = Depends(get_current_user)
):
    db = get_db()
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    export_key = f"creatorai/exports/{user['_id']}/{project_id}/final_export.mp4"
    source_key = None
    
    # 1. READ TIMELINE STATE (Single source of truth)
    # The frontend is expected to pass the state in the payload, or we read from DB.
    # In a full FFmpeg implementation, we would construct an EDL (Edit Decision List) here.
    state = project.get("state", {})
    clips = state.get("clips", [])
    
    # 2. Sort clips by timeline position
    clips.sort(key=lambda c: c.get("startTime", 0))
    
    import tempfile
    import os
    import subprocess
    import urllib.request
    
    with tempfile.TemporaryDirectory() as temp_dir:
        concat_file_path = os.path.join(temp_dir, "concat.txt")
        output_file_path = os.path.join(temp_dir, "output.mp4")
        
        valid_clips = []
        # Gather all video clips and their assets
        for clip in clips:
            if clip.get("type") == "video" and clip.get("assetId"):
                asset = await db.assets.find_one({"_id": ObjectId(clip["assetId"])})
                if asset:
                    valid_clips.append((clip, asset))
                    
        if not valid_clips:
            raise HTTPException(status_code=400, detail="No video clips found in timeline to export.")
            
        with open(concat_file_path, "w") as f:
            for idx, (clip, asset) in enumerate(valid_clips):
                source_key = f"creatorai/{user['_id']}/{project_id}/{asset['filename']}"
                local_video_path = os.path.join(temp_dir, f"video_{idx}.mp4")
                
                # Download file from S3 to temp directory
                try:
                    s3_client.download_file(AWS_BUCKET_NAME, source_key, local_video_path)
                    
                    # Write to concat file
                    # Ensure path format is ffmpeg-friendly (forward slashes)
                    safe_path = local_video_path.replace('\\', '/')
                    f.write(f"file '{safe_path}'\n")
                    
                    # Apply trimming if specified
                    if "sourceStart" in clip and clip["sourceStart"] > 0:
                        f.write(f"inpoint {clip['sourceStart']}\n")
                    if "sourceEnd" in clip and clip["sourceEnd"] > 0:
                        f.write(f"outpoint {clip['sourceEnd']}\n")
                        
                except Exception as e:
                    print(f"Failed to download asset {asset['filename']}: {e}")
                    
        # Run FFmpeg to concatenate
        try:
            # We use re-encoding to ensure different formats/codecs merge properly
            # and to prepare for future text overlays
            cmd = [
                "ffmpeg", "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file_path,
                "-c:v", "libx264",
                "-preset", "fast",
                "-c:a", "aac",
                output_file_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            
            # Upload the final stitched video to S3
            s3_client.upload_file(output_file_path, AWS_BUCKET_NAME, export_key)
            
        except subprocess.CalledProcessError as e:
            print("FFmpeg Error Output:", e.stderr.decode())
            # Fallback if FFmpeg fails: Just copy the first video in S3 like before
            if valid_clips:
                clip, asset = valid_clips[0]
                source_key = f"creatorai/{user['_id']}/{project_id}/{asset['filename']}"
                s3_client.copy_object(
                    Bucket=AWS_BUCKET_NAME,
                    CopySource={'Bucket': AWS_BUCKET_NAME, 'Key': source_key},
                    Key=export_key
                )
            else:
                raise HTTPException(status_code=500, detail="Failed to render export.")
        except Exception as e:
            print("Export Pipeline Error:", e)
            raise HTTPException(status_code=500, detail="Failed to render export.")

    # Generate presigned URL for the exported file
    export_url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': AWS_BUCKET_NAME, 'Key': export_key},
        ExpiresIn=3600
    )
    
    # Update project with export URL
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"last_export_url": export_url}}
    )
    
    return {"message": "Export completed successfully", "export_url": export_url}
    
@router.post("/{project_id}/ai-command")
async def process_ai_command(
    project_id: str,
    payload: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    prompt = payload.get("prompt")
    context = payload.get("context")
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
        
    openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
        
    system_prompt = """
    You are an AI video editing assistant for CreatorAI. 
    You receive the current editor context (timeline, playhead, tracks, clips) and a user command.
    You must output ONLY valid JSON containing a response message and an array of commands to execute.
    Supported command types: "add_text", "apply_effect", "add_clip", "remove_clip".
    
    Example output format:
    {
      "message": "I've added a text clip.",
      "commands": [
        {
          "type": "add_text",
          "content": "Hello World",
          "timelineStart": 0,
          "timelineDuration": 5
        }
      ]
    }
    """
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "google/gemini-flash-1.5-exp", # Using gemini flash as requested
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Context: {json.dumps(context)}\n\nUser Command: {prompt}"}
                    ],
                    "response_format": {"type": "json_object"}
                },
                timeout=15.0
            )
            
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Clean up markdown if the model returns it
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            result = json.loads(content)
            return result
            
    except Exception as e:
        print(f"AI Command Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process AI command")
