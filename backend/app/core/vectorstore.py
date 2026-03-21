import chromadb
from chromadb.config import Settings as ChromaSettings
from openai import AsyncOpenAI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

_chroma_client = None
_collection = None
_openai_client = None


async def init_vectorstore():
    global _chroma_client, _collection, _openai_client

    _openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    _chroma_client = chromadb.PersistentClient(
        path=settings.CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False),
    )

    _collection = _chroma_client.get_or_create_collection(
        name=settings.CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    logger.info(f"ChromaDB collection '{settings.CHROMA_COLLECTION_NAME}' ready.")


def get_collection():
    if _collection is None:
        raise RuntimeError("Vector store not initialized. Call init_vectorstore() first.")
    return _collection


def get_openai_client() -> AsyncOpenAI:
    if _openai_client is None:
        raise RuntimeError("OpenAI client not initialized.")
    return _openai_client


async def embed_texts(texts: list[str]) -> list[list[float]]:
    client = get_openai_client()
    response = await client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


async def upsert_chunks(session_id: str, chunks: list[str]):
    """Embed and store resume chunks for a session."""
    collection = get_collection()
    embeddings = await embed_texts(chunks)

    ids = [f"{session_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"session_id": session_id, "chunk_index": i} for i in range(len(chunks))]

    # Delete old chunks for this session if they exist
    try:
        existing = collection.get(where={"session_id": session_id})
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception:
        pass

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )
    logger.info(f"Upserted {len(chunks)} chunks for session {session_id}")


async def retrieve_relevant_chunks(session_id: str, query: str, top_k: int = None) -> list[str]:
    """Retrieve top-k resume chunks most relevant to the JD query."""
    collection = get_collection()
    k = top_k or settings.TOP_K_CHUNKS

    query_embedding = await embed_texts([query])

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(k, collection.count()),
        where={"session_id": session_id},
    )

    return results["documents"][0] if results["documents"] else []
