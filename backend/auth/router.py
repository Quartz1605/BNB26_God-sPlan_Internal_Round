import os
import jwt
from datetime import datetime, timedelta, timezone
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from bson import ObjectId

from database import client

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI")
JWT_SECRET = os.environ.get("JWT_SECRET")
POST_LOGIN_REDIRECT_URL = os.environ.get("POST_LOGIN_REDIRECT_URL")
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"

def create_jwt_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

@router.get("/login")
async def login():
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"scope=openid%20email%20profile%20https://www.googleapis.com/auth/youtube.upload&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    return RedirectResponse(google_auth_url)

@router.get("/callback")
async def callback(code: str, response: Response):
    async with httpx.AsyncClient() as client_http:
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        token_res = await client_http.post(token_url, data=data)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve token from Google")
        
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        
        user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_info_res = await client_http.get(user_info_url, headers=headers)
        
        if user_info_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve user info from Google")
            
        user_info = user_info_res.json()
        
    db = client.get_default_database()
    users_collection = db.users
    
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")
    
    user = await users_collection.find_one({"email": email})
    if not user:
        user_doc = {
            "email": email,
            "name": name,
            "picture": picture,
            "google_access_token": access_token,
            "created_at": datetime.now(timezone.utc)
        }
        result = await users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
    else:
        user_id = str(user["_id"])
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"google_access_token": access_token}}
        )
        
    jwt_token = create_jwt_token({"sub": str(user_id), "email": email})
    
    redirect_res = RedirectResponse(url=POST_LOGIN_REDIRECT_URL)
    redirect_res.set_cookie(
        key="access_token",
        value=f"Bearer {jwt_token}",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=7 * 24 * 60 * 60 # 7 days
    )
    return redirect_res

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    try:
        scheme, token = token.split(" ", 1)
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token scheme")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    db = client.get_default_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    user["_id"] = str(user["_id"])
    return user

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}
