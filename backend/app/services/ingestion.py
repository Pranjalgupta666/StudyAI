import fitz  # PyMuPDF
import uuid
import logging
import chromadb
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from app.core.config import get_settings
from app.models.document import Document, DocumentStatus

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Local models — load once at startup ──────────────────────────────────────
# First run downloads ~90MB model to ~/.cache/huggingface — one-time only
embedder = SentenceTransformer(settings.EMBEDDING_MODEL)

# ChromaDB persists to disk — no account, no key
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
collection = chroma_client.get_or_create_collection(
    name="studyai_docs",
    metadata={"hnsw:space": "cosine"},
)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.CHUNK_SIZE,
    chunk_overlap=settings.CHUNK_OVERLAP,
    separators=["\n\n", "\n", ". ", " ", ""],
)


def extract_text(contents: bytes) -> tuple[list[dict], int]:
    doc = fitz.open(stream=contents, filetype="pdf")
    pages = []
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text").strip()
        if text:
            pages.append({"text": text, "page_number": page_num})
    return pages, len(doc)


def chunk_pages(pages: list[dict]) -> list[dict]:
    chunks = []
    for page in pages:
        for chunk_text in text_splitter.split_text(page["text"]):
            chunks.append({"text": chunk_text, "page_number": page["page_number"]})
    return chunks


def embed_chunks(texts: list[str]) -> list[list[float]]:
    """Run sentence-transformers locally — completely free, no API call."""
    vectors = embedder.encode(texts, show_progress_bar=False)
    return vectors.tolist()


def upsert_to_chroma(doc_id: str, user_id: str, chunks: list[dict]) -> list[str]:
    """Store vectors + text in local ChromaDB."""
    texts = [c["text"] for c in chunks]
    vectors = embed_chunks(texts)

    ids = [f"{doc_id}-{i}" for i in range(len(chunks))]
    metadatas = [
        {"doc_id": doc_id, "user_id": user_id, "page_number": c["page_number"], "chunk_index": i}
        for i, c in enumerate(chunks)
    ]

    collection.upsert(
        ids=ids,
        embeddings=vectors,
        documents=texts,
        metadatas=metadatas,
    )
    return ids


async def ingest_pdf(doc_id: str, user_id: str, contents: bytes, db: AsyncSession) -> None:
    try:
        logger.info(f"[{doc_id}] Starting ingestion")

        await db.execute(
            update(Document).where(Document.id == doc_id)
            .values(status=DocumentStatus.PROCESSING)
        )
        await db.commit()

        # 1. Extract text
        pages, page_count = extract_text(contents)
        logger.info(f"[{doc_id}] {page_count} pages extracted")

        # 2. Chunk
        chunks = chunk_pages(pages)
        logger.info(f"[{doc_id}] {len(chunks)} chunks created")

        # 3. Embed + store in ChromaDB (all local, all free)
        upsert_to_chroma(doc_id, user_id, chunks)
        logger.info(f"[{doc_id}] Stored in ChromaDB")

        # 4. Mark ready
        await db.execute(
            update(Document).where(Document.id == doc_id)
            .values(status=DocumentStatus.READY, page_count=page_count, chunk_count=len(chunks))
        )
        await db.commit()
        logger.info(f"[{doc_id}] Done ✓")

    except Exception as e:
        logger.error(f"[{doc_id}] Failed: {e}")
        await db.execute(
            update(Document).where(Document.id == doc_id)
            .values(status=DocumentStatus.FAILED, error_message=str(e))
        )
        await db.commit()
        raise
