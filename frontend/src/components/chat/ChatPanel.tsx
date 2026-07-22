"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { streamAsk } from "@/lib/api";
interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}
export default function ChatPanel({ docId }) {
const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I have read your document. Ask me anything!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = async () => {
    const q = input.trim(); if (!q || loading) return;
    setInput(""); setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);
    try {
      let accumulated = "";
      for await (const token of streamAsk(docId, q)) {
        accumulated += token;
        setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: accumulated, streaming: true }; return u; });
      }
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: accumulated, streaming: false }; return u; });
    } catch (err) {
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: `Error: ${err.message}`, streaming: false }; return u; });
    } finally { setLoading(false); }
  };
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-violet-500/20 text-violet-400" : "bg-blue-500/20 text-blue-400"}`}>
              {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === "assistant" ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-blue-600/20 text-slate-100 border border-blue-500/30"}`}>
              {msg.content || (msg.streaming && <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" /><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" /></span>)}
              {msg.streaming && msg.content && <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask a question..." disabled={loading} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
          <button onClick={send} disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
