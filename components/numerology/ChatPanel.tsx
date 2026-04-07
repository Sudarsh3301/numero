import { memo, useState, useRef, useEffect } from 'react';

interface ChatPanelProps {
  chartContext: any;
  lang: string;
  fetchFollowUp: (question: string, chartContext: any, lang: string, history: any[]) => Promise<string>;
}

export const ChatPanel = memo(function ChatPanel({ chartContext, lang, fetchFollowUp }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [msgs, setMsgs] = useState<Array<{ role: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const el = bottomRef.current;
    if (!el || typeof el.scrollIntoView !== "function") return;

    try {
      el.scrollIntoView({ behavior: "smooth" });
    } catch {
      el.scrollIntoView();
    }
  }, [msgs, isOpen]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const answer = await fetchFollowUp(q, chartContext, lang, historyRef.current);
      // Cap history to last 6 messages (3 turns) to prevent unbounded prompt growth
      const updated = [...historyRef.current, { role: "user", content: q }, { role: "assistant", content: answer }];
      historyRef.current = updated.slice(-6);
      setMsgs(m => [...m, { role: "assistant", text: answer }]);
    } catch (e) {
      const errorMsg = (e as Error).message;
      if (errorMsg.includes('Rate limit') || errorMsg.includes('high demand')) {
        setMsgs(m => [...m, { role: "assistant", text: "⏳ Chat service is experiencing high demand. Please wait 30 seconds and try again." }]);
      } else {
        setMsgs(m => [...m, { role: "assistant", text: "Something went wrong. Try again." }]);
      }
    }
    setBusy(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
        style={{
          background: "linear-gradient(135deg,#7c3aed,#a855f7)",
          boxShadow: "0 4px 20px rgba(139,92,246,0.5)"
        }}
        aria-label="Ask About Your Chart"
      >
        <span className="text-2xl">💬</span>
      </button>
    );
  }

  return (
    <div className="w-[calc(100vw-3rem)] sm:w-[350px] bg-white/[0.04] backdrop-blur-md border border-white/[0.1] rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col font-sans">
      <div className="px-4 py-3 border-b border-white/[0.07] flex justify-between items-start bg-black/20">
        <div>
          <div className="text-[13px] font-bold text-purple-400">💬 Ask About Your Chart</div>
          <div className="text-[11px] text-white/40 mt-1 leading-tight">
            Ask about your directions, flying stars, numbers, or year forecast
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white/40 hover:text-white transition-colors p-1"
          aria-label="Close Chat"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[300px] sm:max-h-[350px] min-h-[200px] overflow-y-auto px-4 py-3 flex flex-col gap-3 scrollbar-none sm:scrollbar-organic">
        {msgs.length === 0 && (
          <div className="text-[11px] text-white/20 text-center py-5 italic">No questions yet.</div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className="max-w-[85%] rounded-xl px-3 py-2 text-[12px] sm:text-[13px] text-white/90 leading-relaxed shadow-sm"
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.05)",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              border: m.role !== "user" ? "1px solid rgba(255,255,255,0.05)" : "none"
            }}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="self-start bg-white/[0.05] border border-white/[0.05] rounded-xl rounded-bl-sm px-3 py-2 text-[12px] text-white/40 animate-pulse">
            ✦ consulting the stars…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/[0.07] flex gap-2 bg-black/10">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={lang === "hi" ? "अपना सवाल पूछें…" : "Ask a follow-up question…"}
          className="flex-1 bg-white/[0.05] border-[1.5px] border-white/[0.08] rounded-xl text-white px-3 py-2.5 text-[13px] outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="px-4 py-2.5 rounded-xl border-none font-bold text-[14px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            background: busy || !input.trim() ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
            boxShadow: busy || !input.trim() ? "none" : "0 4px 15px rgba(139,92,246,0.4)"
          }}
        >
          →
        </button>
      </div>
    </div>
  );
});
