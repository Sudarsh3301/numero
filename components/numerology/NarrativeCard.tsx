import { memo } from 'react';

interface NarrativeCardProps {
  sections: Array<{
    title: string;
    body: string;
  }>;
}

export const NarrativeCard = memo(function NarrativeCard({ sections }: NarrativeCardProps) {
  return (
    <div className="bg-white/[0.04] rounded-organic p-4">
      <div className="text-[13px] font-bold text-mystic-purple-400 mb-3 tracking-wide">
        ✨ AI Insights
      </div>

      {sections.map((s, i) => (
        <div key={i} className={i < sections.length - 1 ? "mb-4" : ""}>
          <div className="text-[12px] font-bold text-white/90 mb-1.5 border-l-[3px] border-mystic-purple-500 pl-2">
            {s.title}
          </div>
          <div className="text-[12px] text-white/65 leading-relaxed pl-2">
            {s.body}
          </div>
        </div>
      ))}
    </div>
  );
});
