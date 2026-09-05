import { memo } from 'react';

interface ArrowsPanelProps {
  arrows: {
    present: Array<{ name: string; desc: string }>;
    absent: Array<{ name: string }>;
  };
}

export const ArrowsPanel = memo(function ArrowsPanel({ arrows }: ArrowsPanelProps) {
  if (!arrows.present.length && !arrows.absent.length) return null;

  return (
    <div className="bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-2.5">⚡ Pythagoras Arrows</div>

      {arrows.present.map((a, i) => (
        <div key={i} className="flex items-start gap-2 mb-1.5">
          <span className="text-[13px] text-success mt-0.5">✦</span>
          <div>
            <div className="text-[11px] font-bold text-success">{a.name}</div>
            <div className="text-[10px] text-white/45">{a.desc}</div>
          </div>
        </div>
      ))}

      {arrows.absent.map((a, i) => (
        <div key={i} className="flex items-start gap-2 mb-1.5">
          <span className="text-[13px] text-red-400 mt-0.5">✗</span>
          <div className="text-[11px] font-bold text-red-400">{a.name}</div>
        </div>
      ))}
    </div>
  );
});
