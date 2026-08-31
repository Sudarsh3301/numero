import { memo } from 'react';

interface NarrativeCardProps {
  sections: Array<{
    title: string;
    body: string;
  }>;
  onGenerate?: () => void;
  isGenerating?: boolean;
  errorMessage?: string;
}

export const NarrativeCard = memo(function NarrativeCard({ sections, onGenerate, isGenerating, errorMessage }: NarrativeCardProps) {
  const hasInsights = sections && sections.length > 0;

  return (
    <div className="bg-white/[0.04] rounded-organic p-4 flex flex-col items-center sm:items-stretch">
      <div className="text-[13px] font-bold text-mystic-purple-400 mb-3 tracking-wide self-start">
        ✨ AI Insights
      </div>

      {errorMessage ? (
        <p className="text-sm text-white/40 text-center">
          AI insights temporarily unavailable. Your chart above is unaffected.
        </p>
      ) : !hasInsights ? (
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="mx-auto mt-2 px-6 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            boxShadow: "0 0 15px rgba(139,92,246,0.3)"
          }}
        >
          {isGenerating ? "Generating..." : "Generate AI Insights"}
        </button>
      ) : (
        sections.map((s, i) => (
          <div key={i} className={i < sections.length - 1 ? "mb-4" : ""}>
            <div className="text-[12px] font-bold text-white/90 mb-1.5 border-l-[3px] border-mystic-purple-500 pl-2">
              {s.title}
            </div>
            <div className="text-[12px] text-white/65 leading-relaxed pl-2">
              {s.body}
            </div>
          </div>
        ))
      )}
    </div>
  );
});
