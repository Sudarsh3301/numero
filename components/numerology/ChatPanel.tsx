import { memo, useState, useRef, useEffect } from 'react';

interface ChatPanelProps {
  chartContext: any;
  lang: string;
  fetchFollowUp: (question: string, chartContext: any, lang: string, history: any[]) => Promise<string>;
}

export const ChatPanel = memo(function ChatPanel({ chartContext, lang, fetchFollowUp }: ChatPanelProps) {
  const [msgs, setMsgs] = useState<Array<{ role: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<any[]>([]);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el || typeof el.scrollIntoView !== "function") return;

    try {
      el.scrollIntoView({ behavior: "smooth" });
    } catch {
      el.scrollIntoView();
    }
  }, [msgs]);

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

  return (
    <div className="bg-white/[0.04] rounded-organic overflow-hidden">
      <div className="px-3.5 py-3 border-b border-white/[0.07]">
        <div className="text-[12px] font-bold text-mystic-purple-400">💬 Ask About Your Chart</div>
        <div className="text-[10px] text-white/30 mt-0.5">
          Ask about your directions, flying stars, numbers, or year forecast
        </div>
      </div>

      <div className="max-h-[260px] overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 scrollbar-organic">
        {msgs.length === 0 && (
          <div className="text-[11px] text-white/20 text-center py-5">No questions yet.</div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className="max-w-[85%] rounded-xl px-3 py-2 text-[12px] text-white/80 leading-relaxed"
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.07)",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px"
            }}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="self-start bg-white/[0.07] rounded-xl rounded-bl-sm px-3 py-2 text-[12px] text-white/40">
            ✦ consulting the stars…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2.5 border-t border-white/[0.07] flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={lang === "hi" ? "अपना सवाल पूछें…" : "Ask a follow-up question…"}
          className="flex-1 bg-white/[0.07] border-[1.5px] border-white/[0.12] rounded-lg text-white px-3 py-2 text-[12px] outline-none focus:border-solar-500/30 focus:ring-1 focus:ring-solar-500/30 transition-all"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="px-3.5 py-2 rounded-lg border-none font-bold text-[12px] text-white transition-all disabled:cursor-not-allowed"
          style={{
            cursor: busy || !input.trim() ? "not-allowed" : "pointer",
            background: busy || !input.trim() ? "rgba(124,58,237,0.25)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
            boxShadow: busy ? "none" : "0 0 10px rgba(139,92,246,0.4)"
          }}
        >
          →
        </button>
      </div>
    </div>
  );
});
