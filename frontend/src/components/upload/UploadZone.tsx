"use client";
import { useState, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { uploadPDF, pollUntilReady } from "@/lib/api";
export default function UploadZone({ onDocumentReady }) {
  const [state, setState] = useState({ phase: "idle" });
  const [dragging, setDragging] = useState(false);
  const handleFile = useCallback(async (file) => {
    if (!file.name.endsWith(".pdf")) { setState({ phase: "error", message: "Only PDF files are supported." }); return; }
    if (file.size > 50 * 1024 * 1024) { setState({ phase: "error", message: "File must be under 50 MB." }); return; }
    try {
      setState({ phase: "uploading" });
      const upload = await uploadPDF(file);
      setState({ phase: "processing", status: { doc_id: upload.doc_id, status: "processing", page_count: 0, chunk_count: 0, error: null } });
      const final = await pollUntilReady(upload.doc_id, (s) => setState({ phase: "processing", status: s }));
      if (final.status === "failed") { setState({ phase: "error", message: final.error || "Processing failed." }); return; }
      setState({ phase: "done", docId: upload.doc_id, filename: file.name });
      onDocumentReady(upload.doc_id, file.name);
    } catch (err) { setState({ phase: "error", message: err.message }); }
  }, [onDocumentReady]);
  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }, [handleFile]);
  return (
    <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${dragging ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-500"}`}>
      {state.phase === "idle" && (<><Upload className="mx-auto mb-3 text-slate-500" size={28} /><p className="text-slate-300 font-medium mb-1 text-sm">Drop PDF here</p><label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-block mt-2">Choose PDF<input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} /></label><p className="text-slate-600 text-xs mt-2">Max 50 MB</p></>)}
      {state.phase === "uploading" && <div className="flex flex-col items-center gap-2"><Loader2 className="text-blue-400 animate-spin" size={24} /><p className="text-slate-300 text-xs">Uploading...</p></div>}
      {state.phase === "processing" && <div className="flex flex-col items-center gap-2"><Loader2 className="text-violet-400 animate-spin" size={24} /><p className="text-slate-300 text-xs">Processing...</p>{state.status?.chunk_count > 0 && <p className="text-violet-400 text-xs">{state.status.chunk_count} chunks indexed</p>}</div>}
      {state.phase === "done" && <div className="flex flex-col items-center gap-2"><CheckCircle className="text-emerald-400" size={24} /><p className="text-slate-300 text-xs">{state.filename}</p><button onClick={() => setState({ phase: "idle" })} className="text-xs text-slate-500 hover:text-slate-300">Upload another</button></div>}
      {state.phase === "error" && <div className="flex flex-col items-center gap-2"><AlertCircle className="text-red-400" size={24} /><p className="text-red-400 text-xs">{state.message}</p><button onClick={() => setState({ phase: "idle" })} className="text-xs text-slate-400 hover:text-slate-200">Try again</button></div>}
    </div>
  );
}
