import uuid
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.config import get_settings
from app.db.database import get_db, AsyncSessionLocal
from app.models.document import Document, DocumentStatus
from app.services import storage
from app.services.ingestion import ingest_pdf

router = APIRouter(prefix="/documents", tags=["documents"])
logger = logging.getLogger(__name__)
settings = get_settings()


@router.post("/upload", status_code=202)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = "demo-user",
    db: AsyncSession = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files accepted.")

    contents = await file.read()
    if len(contents) > settings.max_file_size_bytes:
        raise HTTPException(413, f"File exceeds {settings.MAX_FILE_SIZE_MB} MB.")

    doc_id = str(uuid.uuid4())
    storage_key = await storage.upload(user_id, doc_id, file.filename, contents)

    doc = Document(
        id=doc_id,
        user_id=user_id,
        filename=file.filename,
        storage_key=storage_key,
        status=DocumentStatus.UPLOADING,
        file_size_bytes=len(contents),
    )
    db.add(doc)
    await db.commit()

    background_tasks.add_task(_run_ingestion, doc_id, user_id, contents)

    file_url = await storage.get_file_url(storage_key)
    return {"doc_id": doc_id, "filename": file.filename, "file_url": file_url, "status": "processing"}


async def _run_ingestion(doc_id: str, user_id: str, contents: bytes) -> None:
    async with AsyncSessionLocal() as db:
        await ingest_pdf(doc_id, user_id, contents, db)


@router.get("/{doc_id}/status")
async def get_status(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found.")
    return {"doc_id": doc.id, "status": doc.status, "page_count": doc.page_count, "chunk_count": doc.chunk_count, "error": doc.error_message}


@router.get("/")
async def list_documents(user_id: str = "demo-user", db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [{"doc_id": d.id, "filename": d.filename, "status": d.status, "page_count": d.page_count, "chunk_count": d.chunk_count} for d in docs]


@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found.")
    await storage.delete_file(doc.storage_key)

    # Remove from ChromaDB
    from app.services.ingestion import collection
    collection.delete(where={"doc_id": doc_id})

    await db.delete(doc)
    await db.commit()
