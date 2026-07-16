import logging
from groq import Groq
from app.core.config import get_settings
from app.services.ingestion import embedder, collection

logger = logging.getLogger(__name__)
settings = get_settings()

# Groq — free tier, no credit card needed
groq_client = Groq(api_key=settings.GEMINI_API_KEY)


def retrieve_chunks(question: str, doc_id: str) -> list[dict]:
    """Embed query locally, search ChromaDB locally — 100% free."""
    query_vector = embedder.encode([question])[0].tolist()
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=settings.TOP_K_RESULTS,
        where={"doc_id": doc_id},
        include=["documents", "metadatas", "distances"],
    )
    chunks = []
    for text, meta in zip(results["documents"][0], results["metadatas"][0]):
        chunks.append({"text": text, "page_number": meta.get("page_number", 0)})
    return chunks


def build_prompt(question: str, chunks: list[dict], mode: str = "qa") -> str:
    context = "\n\n---\n\n".join(
        f"[Page {c['page_number']}] {c['text']}" for c in chunks
    )
    if mode == "summary":
        return f"""Summarize the following document excerpts clearly. Use bullet points for key concepts.

DOCUMENT EXCERPTS:
{context}

Write a comprehensive summary:"""

    if mode == "quiz":
        return f"""Generate 5 multiple-choice quiz questions based on these document excerpts.

Format exactly like this:
Q1. [Question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Answer: [Letter]
Explanation: [Brief explanation]

DOCUMENT EXCERPTS:
{context}

Generate 5 questions:"""

    return f"""You are a helpful study assistant. Answer the student's question using ONLY the excerpts below. If the answer isn't in the excerpts, say so. Cite page numbers.

DOCUMENT EXCERPTS:
{context}

QUESTION: {question}

Answer:"""


async def ask_question(doc_id: str, question: str) -> str:
    chunks = retrieve_chunks(question, doc_id)
    if not chunks:
        return "I couldn't find relevant content in this document."
    prompt = build_prompt(question, chunks, mode="qa")
    return groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content


async def summarize_document(doc_id: str, topic: str = "") -> str:
    query = topic or "main concepts key ideas summary overview"
    chunks = retrieve_chunks(query, doc_id)
    prompt = build_prompt(query, chunks, mode="summary")
    return groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content


async def generate_quiz(doc_id: str) -> str:
    chunks = retrieve_chunks("important concepts definitions facts", doc_id)
    prompt = build_prompt("", chunks, mode="quiz")
    return groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content


async def stream_answer(doc_id: str, question: str):
    """Stream Groq response token by token."""
    chunks = retrieve_chunks(question, doc_id)
    prompt = build_prompt(question, chunks, mode="qa")
    stream = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield token