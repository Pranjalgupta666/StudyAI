"use client";
import { useState, useEffect } from "react";
import { BookOpen, MessageSquare, FileText, HelpCircle, Trash2 } from "lucide-react";
import UploadZone from "@/components/upload/UploadZone";
import ChatPanel from "@/components/chat/ChatPanel";
import SummaryPanel from "@/components/summary/SummaryPanel";
import QuizPanel from "@/components/quiz/QuizPanel";
import { listDocuments, deleteDocument, DocumentRecord } from "@/lib/api";

type Tab = "ask" | "summary" | "quiz";

export default function Home() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("ask");

  useEffect(() => {
    listDocuments().then(setDocs).catch(console.error);
  }, []);

  const activeDoc = docs.find((d) => d.doc_id === activeDocId);

  const handleDocumentReady = (docId: string, filename: string) => {
    listDocuments().then(setDocs);
    setActiveDocId(docId);
  };

  const handleDelete = async (docId: string) => {
    await deleteDocument(docId);
    setDocs((prev) => prev.filter((d) => d.doc_id !== docId));
    if (activeDocId === docId) setActiveDocId(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ask", label: "Ask", icon: <MessageSquare size={14} /> },
    { id: "summary", label: "Summarize", icon: <FileText size={14} /> },
    { id: "quiz", label: "Quiz", icon: <HelpCircle size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0A1020] border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-semibold text-sm font-mono tracking-tight">StudyAI</span>
          </div>
        </div>

        <div className="p-3">
          <UploadZone onDocumentReady={handleDocumentReady} />
        </div>

        <div className="px-3 pb-2">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium mb-2 px-1">
            Documents
          </p>
          <div className="space-y-0.5">
            {docs.filter((d) => d.status === "ready").map((doc) => (
              <div
                key={doc.doc_id}
                className={`
                  group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all
                  ${activeDocId === doc.doc_id
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"}
                `}
                onClick={() => setActiveDocId(doc.doc_id)}
              >
                <BookOpen size={13} className="flex-shrink-0" />
                <span className="text-xs truncate flex-1">{doc.filename.replace(".pdf", "")}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.doc_id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {docs.filter((d) => d.status === "ready").length === 0 && (
              <p className="text-xs text-slate-700 px-1 py-2">No documents yet</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {activeDocId ? (
          <>
            {/* Tab bar */}
            <div className="border-b border-slate-800 px-6 flex gap-1 pt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all
                    ${activeTab === tab.id
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"}
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto pb-2 flex items-end">
                <span className="text-xs text-slate-600">
                  {activeDoc?.filename} · {activeDoc?.page_count} pages
                </span>
              </div>
            </div>

            {/* Panel */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "ask" && <ChatPanel docId={activeDocId} />}
              {activeTab === "summary" && <SummaryPanel docId={activeDocId} />}
              {activeTab === "quiz" && <QuizPanel docId={activeDocId} />}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-slate-600" />
            </div>
            <h2 className="text-slate-300 font-medium mb-2">No document selected</h2>
            <p className="text-slate-600 text-sm max-w-xs">
              Upload a PDF or select one from the sidebar to start asking questions, summarizing, or generating quizzes.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
