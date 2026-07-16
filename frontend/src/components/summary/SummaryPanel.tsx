"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { summarizeDocument } from "@/lib/api";
const TYPES = [{ label: "Full Summary", topic: "main concepts key ideas overview" }, { label: "Key Concepts", topic: "key concepts definitions important terms" }, { label: "TL;DR", topic: "brief summary essential points" }];
export default function SummaryPanel({ docId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(null);
  const [error, setError] = useState(null);
  const generate = async (type) => {
    setLoading(true); setActive(type.label); setError(null); setSummary(null);
    try { const result = await summarizeDocument(docId, type.topic); setSummary(result); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((type) => (<button key={type.label} onClick={() => generate(type)} disabled={loading} className={`px-3 py-2 rounded-lg text-sm border transition-all disabled:opacity-50 ${active === type.label && !loading ? "border-violet-500 text-violet-300 bg-violet-500/10" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>{type.label}</button>))}
      </div>
      {loading && <div className="flex items-center gap-3 py-8 justify-center"><Loader2 size={18} className="animate-spin text-violet-400" /><span className="text-sm text-slate-400">Generating {active}...</span></div>}
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>}
      {summary && !loading && <div className="bg-slate-900 border border-slate-700 rounded-xl p-5"><span className="text-xs font-medium text-violet-400 uppercase tracking-wider">{active}</span><div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mt-3">{summary}</div></div>}
      {!summary && !loading && !error && <div className="text-center py-12 text-slate-600 text-sm">Choose a summary type above to get started</div>}
    </div>
  );
}
