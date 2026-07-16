"use client";
import { useState } from "react";
import { generateQuiz } from "@/lib/api";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
function parseQuiz(raw) {
  return raw.split(/Q\d+\./).filter(Boolean).map((block) => {
    const lines = block.trim().split("\n").filter(Boolean);
    const text = lines[0]?.trim() || "";
    const options = []; let answer = ""; let explanation = "";
    for (const line of lines.slice(1)) {
      const o = line.match(/^([A-D])\)\s*(.+)/); if (o) options.push({ letter: o[1], text: o[2].trim() });
      const a = line.match(/^Answer:\s*([A-D])/); if (a) answer = a[1];
      const e = line.match(/^Explanation:\s*(.+)/); if (e) explanation = e[1].trim();
    }
    return { text, options, answer, explanation };
  });
}
export default function QuizPanel({ docId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [score, setScore] = useState(null);
  const generate = async () => {
    setLoading(true); setError(null); setSelected({}); setRevealed({}); setScore(null);
    try { const raw = await generateQuiz(docId); setQuestions(parseQuiz(raw)); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const choose = (qi, letter) => {
    if (selected[qi]) return;
    setSelected((p) => ({ ...p, [qi]: letter }));
    setRevealed((p) => ({ ...p, [qi]: true }));
  };
  const submitAll = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (selected[i] === q.answer) correct++; });
    setScore(correct);
    setRevealed(Object.fromEntries(questions.map((_, i) => [i, true])));
  };
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={generate} disabled={loading} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">{loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}{loading ? "Generating..." : questions.length ? "New quiz" : "Generate quiz"}</button>
        {score !== null && <div className="text-sm text-slate-300">Score: <span className={score >= questions.length * 0.7 ? "text-emerald-400" : "text-amber-400"}>{score}/{questions.length}</span></div>}
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>}
      {!loading && questions.length === 0 && !error && <div className="text-center py-12 text-slate-600 text-sm">Click Generate quiz to create questions from your document</div>}
      {questions.map((q, i) => (
        <div key={i} className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3">
          <p className="text-slate-200 text-sm font-medium"><span className="text-violet-400 mr-2">Q{i+1}.</span>{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const isSel = selected[i] === opt.letter; const isCorr = opt.letter === q.answer; const show = revealed[i];
              return (<button key={opt.letter} onClick={() => choose(i, opt.letter)} disabled={!!selected[i]} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm border disabled:cursor-default ${show && isCorr ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : show && isSel && !isCorr ? "border-red-500 bg-red-500/10 text-red-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}><span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">{opt.letter}</span><span>{opt.text}</span>{show && isCorr && <CheckCircle size={14} className="ml-auto text-emerald-400" />}{show && isSel && !isCorr && <XCircle size={14} className="ml-auto text-red-400" />}</button>);
            })}
          </div>
          {revealed[i] && q.explanation && <p className="text-xs text-slate-500 border-t border-slate-800 pt-3"><span className="text-slate-400 font-medium">Explanation: </span>{q.explanation}</p>}
        </div>
      ))}
      {questions.length > 0 && questions.every((_, i) => !!selected[i]) && score === null && <button onClick={submitAll} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium">See final score</button>}
    </div>
  );
}
