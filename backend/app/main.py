from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import analyze, health, auth
from app.core.config import settings
from app.core.vectorstore import init_vectorstore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing vector store...")
    await init_vectorstore()
    logger.info("Vector store ready.")
    yield


app = FastAPI(
    title="ResumeIQ API",
    description="AI-powered ATS resume scoring with auth",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,   prefix="/api/v1", tags=["health"])
app.include_router(auth.router,     prefix="/api/v1", tags=["auth"])
app.include_router(analyze.router,  prefix="/api/v1", tags=["analyze"])


@app.get("/")
async def root():
    return {"message": "ResumeIQ API v2", "docs": "/docs"}
