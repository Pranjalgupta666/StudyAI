from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.document import Document, DocumentStatus
from app.services.rag import ask_question, summarize_document, generate_quiz, stream_answer

router = APIRouter(prefix="/ai", tags=["ai"])


class AskRequest(BaseModel):
    doc_id: str
    question: str

class SummarizeRequest(BaseModel):
    doc_id: str
    topic: str = ""

class QuizRequest(BaseModel):
    doc_id: str


async def require_ready(doc_id: str, db: AsyncSession) -> Document:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found.")
    if doc.status != DocumentStatus.READY:
        raise HTTPException(400, f"Document not ready yet (status: {doc.status}).")
    return doc


@router.post("/ask")
async def ask(req: AskRequest, db: AsyncSession = Depends(get_db)):
    await require_ready(req.doc_id, db)
    answer = await ask_question(req.doc_id, req.question)
    return {"answer": answer}


@router.post("/ask/stream")
async def ask_stream(req: AskRequest, db: AsyncSession = Depends(get_db)):
    await require_ready(req.doc_id, db)
    async def gen():
        async for token in stream_answer(req.doc_id, req.question):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")


@router.post("/summarize")
async def summarize(req: SummarizeRequest, db: AsyncSession = Depends(get_db)):
    await require_ready(req.doc_id, db)
    summary = await summarize_document(req.doc_id, req.topic)
    return {"summary": summary}


@router.post("/quiz")
async def quiz(req: QuizRequest, db: AsyncSession = Depends(get_db)):
    await require_ready(req.doc_id, db)
    questions = await generate_quiz(req.doc_id)
    return {"quiz": questions}
