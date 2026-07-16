const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
export async function uploadPDF(file, userId = "demo-user") {
  const form = new FormData(); form.append("file", file);
  const res = await fetch(`${API}/documents/upload?user_id=${userId}`, { method: "POST", body: form });
  if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Upload failed"); }
  return res.json();
}
export async function getDocumentStatus(docId) {
  const res = await fetch(`${API}/documents/${docId}/status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}
export async function listDocuments(userId = "demo-user") {
  const res = await fetch(`${API}/documents?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to list documents");
  return res.json();
}
export async function deleteDocument(docId) {
  await fetch(`${API}/documents/${docId}`, { method: "DELETE" });
}
export async function summarizeDocument(docId, topic = "") {
  const res = await fetch(`${API}/ai/summarize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc_id: docId, topic }) });
  if (!res.ok) throw new Error("Summarize failed");
  const data = await res.json(); return data.summary;
}
export async function generateQuiz(docId) {
  const res = await fetch(`${API}/ai/quiz`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc_id: docId }) });
  if (!res.ok) throw new Error("Quiz generation failed");
  const data = await res.json(); return data.quiz;
}
export async function* streamAsk(docId, question) {
  const res = await fetch(`${API}/ai/ask/stream`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc_id: docId, question }) });
  if (!res.ok) throw new Error("Stream failed");
  const reader = res.body.getReader(); const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    const text = decoder.decode(value, { stream: true });
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) { const token = line.slice(6); if (token === "[DONE]") return; yield token; }
    }
  }
}
export async function pollUntilReady(docId, onUpdate, intervalMs = 2000, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await getDocumentStatus(docId); onUpdate(status);
    if (status.status === "ready" || status.status === "failed") return status;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Timed out");
}
