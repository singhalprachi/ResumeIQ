from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import uuid
import logging

from app.core.config import settings
from app.core.vectorstore import upsert_chunks
from app.services.parser import parse_document, chunk_text
from app.services.scorer import run_ats_analysis
from app.models.schemas import AnalysisRequest, AnalysisResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory session store (for stateless Railway deployment)
# For production scale, replace with Redis
_session_store: dict[str, dict] = {}
# ✅ ADD THESE TWO — OPTIONS preflight handlers
@router.options("/upload-resume")
async def upload_resume_options():
    return JSONResponse(content={}, status_code=200)

@router.options("/analyze")
async def analyze_options():
    return JSONResponse(content={}, status_code=200)


@router.post("/upload-resume", summary="Upload and parse a resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a PDF or DOCX resume. Returns a session_id to use in /analyze.
    """
    # Validate file type
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Please upload PDF or DOCX.",
        )

    # Validate file size
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f}MB). Maximum allowed: {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Parse document
    try:
        full_text, sections, page_count = parse_document(file_bytes, file.content_type)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Generate session ID
    session_id = str(uuid.uuid4())

    # Chunk and embed into ChromaDB (RAG pipeline)
    chunks = chunk_text(full_text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
    await upsert_chunks(session_id, chunks)

    # Store parsed data in session
    _session_store[session_id] = {
        "full_text": full_text,
        "sections": sections,
        "filename": file.filename,
        "chunks_count": len(chunks),
        "page_count": page_count,
    }

    logger.info(f"Resume uploaded: session={session_id}, chunks={len(chunks)}, file={file.filename}")

    return {
        "session_id": session_id,
        "filename": file.filename,
        "pages_detected": page_count,
        "sections_detected": list(sections.keys()),
        "chunks_indexed": len(chunks),
        "message": "Resume parsed and indexed successfully. Ready for analysis.",
    }


@router.post("/analyze", response_model=AnalysisResponse, summary="Analyze resume against JD")
async def analyze_resume(request: AnalysisRequest):
    """
    Run full ATS analysis. Requires a valid session_id from /upload-resume.
    """
    # Retrieve session
    session = _session_store.get(request.session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload your resume again.",
        )

    if not request.job_description or len(request.job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide a complete job description (minimum 50 characters).",
        )

    try:
        result = await run_ats_analysis(
            session_id=request.session_id,
            full_resume_text=session["full_text"],
            resume_sections=session["sections"],
            job_description=request.job_description,
            page_count=session.get("page_count", 1),
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis error for session {request.session_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Analysis failed. Please try again or check your API key.",
        )

    return result


@router.delete("/session/{session_id}", summary="Clean up session data")
async def delete_session(session_id: str):
    """Remove session data and vector store chunks."""
    if session_id in _session_store:
        del _session_store[session_id]
    return {"message": "Session deleted successfully"}
