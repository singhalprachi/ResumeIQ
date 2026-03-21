"""
In-memory vector store - works perfectly on Railway.
No ChromaDB persistence issues.
"""
import logging
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

_openai_client = None
# In-memory store: {session_id: [(chunk_text, embedding)]}
_store: dict[str, list] = {}


async def init_vectorstore():
    global _openai_client
    _openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    logger.info("In-memory vector store ready.")


def get_openai_client() -> AsyncOpenAI:
    if _openai_client is None:
        raise RuntimeError("Vector store not initialized.")
    return _openai_client


async def embed_texts(texts: list[str]) -> list[list[float]]:
    client = get_openai_client()
    response = await client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


async def upsert_chunks(session_id: str, chunks: list[str]):
    embeddings = await embed_texts(chunks)
    _store[session_id] = list(zip(chunks, embeddings))
    logger.info(f"Stored {len(chunks)} chunks for session {session_id}")


async def retrieve_relevant_chunks(
    session_id: str, query: str, top_k: int = None
) -> list[str]:
    if session_id not in _store:
        return []

    k = top_k or settings.TOP_K_CHUNKS
    query_emb = (await embed_texts([query]))[0]

    # Cosine similarity
    def cosine(a, b):
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x ** 2 for x in a) ** 0.5
        nb = sum(x ** 2 for x in b) ** 0.5
        return dot / (na * nb + 1e-9)

    scored = [
        (cosine(query_emb, emb), chunk)
        for chunk, emb in _store[session_id]
    ]
    scored.sort(reverse=True)
    return [chunk for _, chunk in scored[:k]]