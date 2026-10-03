from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
        
    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True

class AssetResponse(BaseModel):
    id: str = Field(alias="_id")
    project_id: str
    user_id: str
    filename: str
    asset_type: str
    file_size: int
    file_url: str
    status: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
