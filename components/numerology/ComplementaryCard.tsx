import { memo } from 'react';
import { analyzeComplementary } from '@/lib/numerology/complementary';
import { cn } from '@/lib/utils/cn';

interface ComplementaryCardProps {
  missing: number[];
  present: number[];
  label: string;
}

export const ComplementaryCard = memo(function ComplementaryCard({
  missing,
  present,
  label
}: ComplementaryCardProps) {
  const analysis = analyzeComplementary(missing, present);

  if (missing.length === 0) {
    return (
      <div className="bg-leaf-400/10 rounded-organic p-3.5 text-center">
        <div className="text-[12px] text-leaf-400 font-bold">
          ✨ No Missing Numbers · {label}
        </div>
        <div className="text-[10px] text-white/40 mt-1">
          Complete Lo Shu Grid - all numbers present
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-1">
        🔄 Complementary Support · {label}
      </div>
      <div className="text-[10px] text-white/35 mb-2">
        Which present numbers can support missing ones
      </div>

      {analysis.map((item, idx) => {
        const supportColor =
          item.supportLevel === 'full' ? "#4ade80" :
          item.supportLevel === 'partial' ? "#f59e0b" : "#f87171";

        return (
          <div
            key={idx}
            className="mb-2 p-2 bg-white/[0.03] rounded-lg"
            style={{ borderLeft: `3px solid ${supportColor}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-md bg-red-500/20 border border-red-400 flex items-center justify-center text-[13px] font-bold text-red-400">
                {item.missing}
              </div>
              <div className="text-[10px] text-white/40">needs</div>
              <div className="flex gap-1">
                {item.complementsNeeded.map(comp => (
                  <div
                    key={comp}
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-bold",
                      item.complementsPresent.includes(comp)
                        ? "bg-leaf-400/20 border border-leaf-400 text-leaf-400"
                        : "bg-white/5 border border-white/10 text-white/30"
                    )}
                  >
                    {comp}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[9px] ml-9" style={{ color: supportColor }}>
              {item.supportLevel === 'full' && "✓ Fully supported"}
              {item.supportLevel === 'partial' && "◐ Partially supported"}
              {item.supportLevel === 'none' && "✗ No support available"}
            </div>
          </div>
        );
      })}

      {present.includes(5) && (
        <div className="mt-2.5 p-2 bg-mystic-purple-500/10 rounded-lg text-[10px] text-mystic-purple-400">
          ✨ Number 5 present: Universal support for all numbers - guides towards will, success & prosperity
        </div>
      )}
    </div>
  );
});
