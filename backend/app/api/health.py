from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.APP_ENV,
        "model": settings.OPENAI_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL,
    }
