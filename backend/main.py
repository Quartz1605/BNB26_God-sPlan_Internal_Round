import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import client
from auth.router import router as auth_router
from api.projects import router as projects_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    client.close()

app = FastAPI(title="BnB API", lifespan=lifespan)

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)

@app.get("/")
async def root():
    return {"message": "Welcome to BnB API"}
