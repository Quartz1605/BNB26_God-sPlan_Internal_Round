import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from bson import ObjectId
import cloudinary
import cloudinary.uploader
from typing import List

from database import client
from auth.router import get_current_user
from .schemas import ProjectCreate, ProjectResponse, AssetResponse

from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/projects", tags=["projects"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", "dtx3ldhne"), # Replace with actual cloud name or add to .env
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

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
        
    # Upload to Cloudinary
    temp_file_path = None
    try:
        import tempfile
        import shutil
        
        # Save to a temporary file first
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file_path = tmp.name

        # For video/audio use resource_type='video' or 'auto'
        resource_type = "auto"
        if file.content_type.startswith("video/"):
            resource_type = "video"
        elif file.content_type.startswith("image/"):
            resource_type = "image"
            
        # Use upload for all, but add chunk_size for videos
        if resource_type == "video":
            upload_result = cloudinary.uploader.upload(
                temp_file_path, 
                resource_type=resource_type,
                folder=f"creatorai/{user['_id']}/{project_id}",
                chunk_size=6000000
            )
        else:
            upload_result = cloudinary.uploader.upload(
                temp_file_path, 
                resource_type=resource_type,
                folder=f"creatorai/{user['_id']}/{project_id}"
            )
        
        file_url = upload_result.get("secure_url")
        file_size = upload_result.get("bytes", 0)
    except Exception as e:
        print(f"Cloudinary upload error: {str(e)}") # Add logging for debug
        raise HTTPException(status_code=500, detail=f"Failed to upload to Cloudinary: {str(e)}")
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
