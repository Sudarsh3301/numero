import { memo } from 'react';
import { getPersonalYearEffect } from '@/lib/numerology/personal-year';

interface PersonalYearCardProps {
  personalYear: number;
  label: string;
}

export const PersonalYearCard = memo(function PersonalYearCard({
  personalYear,
  label
}: PersonalYearCardProps) {
  const pyEffect = getPersonalYearEffect(personalYear);
  const typeColors: Record<string, string> = {
    blessing: "#4ade80",
    testing: "#f59e0b",
    "no-risk": "#f87171",
    judgment: "#94a3b8",
    completion: "#c084fc"
  };
  const color = typeColors[pyEffect.type];

  return (
    <div className="bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-1">
        🔮 2026 Personal Year · {label}
      </div>

      <div
        className="rounded-xl p-3 mt-2 border-[1.5px]"
        style={{
          background: `${color}15`,
          borderColor: `${color}44`
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[20px] font-bold text-white"
            style={{ background: color }}
          >
            {personalYear}
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold" style={{ color }}>
              {pyEffect.name}
            </div>
            {pyEffect.isBlessingYear && (
              <div className="text-[9px] text-leaf-400 mt-0.5">✨ Blessing Year</div>
            )}
          </div>
        </div>

        <div className="text-[11px] text-white/70 mb-1.5 leading-relaxed">
          {pyEffect.effects}
        </div>

        <div className="text-[10px] text-white/50 leading-relaxed italic">
          💡 {pyEffect.guidance}
        </div>
      </div>
    </div>
  );
});
