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
      <div className="bg-leaf-400/10 rounded-organic p-4 text-center border border-leaf-400/30">
        <div className="text-[14px] text-leaf-400 font-bold">
          ✨ No Missing Numbers · {label}
        </div>
        <div className="text-[12px] text-white/50 mt-1">
          Complete Lo Shu Grid - all numbers present
        </div>
      </div>
    );
  }

  const missingSupport = analysis.filter(i => i.supportLevel === 'none');
  const partialSupport = analysis.filter(i => i.supportLevel === 'partial');
  const fullSupport = analysis.filter(i => i.supportLevel === 'full');

  const getGroupStyles = (type: string) => {
    switch (type) {
      case 'none': return { border: 'border-red-500/50', bg: 'bg-red-500/10', titleColor: 'text-red-400' };
      case 'partial': return { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', titleColor: 'text-yellow-400' };
      case 'full': return { border: 'border-green-500/50', bg: 'bg-green-500/10', titleColor: 'text-green-400' };
      default: return { border: 'border-white/10', bg: 'bg-white/5', titleColor: 'text-white' };
    }
  };

  const renderGroup = (title: string, items: typeof analysis, type: string) => {
    if (items.length === 0) return null;
    const styles = getGroupStyles(type);

    return (
      <div className="bg-white/[0.04] rounded-xl p-5 border border-white/5">
        <div className={cn("text-[13px] font-bold mb-4", styles.titleColor)}>
          {title}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className={cn("flex items-center justify-between px-4 py-3 rounded-lg border", styles.bg, styles.border)}
            >
              {/* Missing Number Pill */}
              <div className="w-8 h-8 rounded-md bg-red-500/20 border border-red-400/50 flex items-center justify-center text-[14px] font-bold text-red-300">
                {item.missing}
              </div>

              {/* Arrow */}
              <div className="text-white/30 text-[14px] font-bold mx-2">→</div>

              {/* Complements */}
              <div className="flex gap-1.5">
                {item.complementsNeeded.map(comp => {
                  const isPresent = item.complementsPresent.includes(comp);
                  return (
                    <div
                      key={comp}
                      className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center text-[14px] font-bold",
                        isPresent
                          ? "bg-leaf-400/20 border border-leaf-400 text-leaf-400"
                          : "bg-white/5 border border-white/10 text-white/30"
                      )}
                    >
                      {comp}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
        <div>
          <div className="text-[14px] font-bold text-white/90 mb-1">
            🔄 Complementary Support · {label}
          </div>
          <div className="text-[11px] text-white/40">
            Which present numbers can support missing ones
          </div>
        </div>
        <div className="flex gap-3 text-[11px] font-bold bg-black/20 p-2 px-3 rounded-lg">
          <span className="text-red-400">❌ Missing</span>
          <span className="text-white/20">|</span>
          <span className="text-yellow-400">⚠ Partial</span>
          <span className="text-white/20">|</span>
          <span className="text-green-400">✅ Supported</span>
        </div>
      </div>

      {renderGroup("❌ Missing (No Support)", missingSupport, 'none')}
      {renderGroup("⚠ Partial Support", partialSupport, 'partial')}
      {renderGroup("✅ Fully Supported", fullSupport, 'full')}

      {present.includes(5) && (
        <div className="p-3 bg-mystic-purple-500/10 rounded-lg text-[11px] font-medium text-mystic-purple-300 border border-mystic-purple-500/20 text-center">
          ✨ <strong className="text-white/80">Number 5 present:</strong> Universal support for all numbers - guides towards will, success & prosperity
        </div>
      )}
    </div>
  );
});
