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
      <div className="bg-success/10 rounded-organic p-4 text-center border border-success/30">
        <div className="text-[14px] text-success font-bold">
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

  const renderGroup = (title: string, items: typeof analysis, type: string) => {
    if (items.length === 0) return null;
    
    const isMissing = type === 'none';
    const isPartial = type === 'partial';

    const titleColor = isMissing ? 'text-red-400' : isPartial ? 'text-yellow-400' : 'text-green-400';
    const itemBorder = isMissing ? 'border-red-500/20 hover:border-red-500/40' : isPartial ? 'border-yellow-500/20 hover:border-yellow-500/40' : 'border-green-500/20 hover:border-green-500/40';
    const itemBg = isMissing ? 'bg-red-500/[0.03]' : isPartial ? 'bg-yellow-500/[0.03]' : 'bg-green-500/[0.03]';

    return (
      <div className="flex flex-col items-center w-full mb-8 last:mb-0">
        <div className={cn("text-[13px] font-bold mb-4 uppercase tracking-wider text-center", titleColor)}>
          {title}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 w-full justify-items-center">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl border w-full max-w-[240px] transition-colors",
                itemBg, 
                itemBorder
              )}
            >
              {/* Missing Number indicator (Problem) */}
              <div className={cn(
                "flex-shrink-0 flex items-center justify-center w-8 h-8 text-[14px] font-bold shadow-inner rounded-[10px]",
                isMissing ? "bg-red-500/20 border border-red-500/40 text-red-200" :
                isPartial ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-200" :
                "bg-green-500/20 border border-green-500/40 text-green-200"
              )}>
                {item.missing}
              </div>

              {/* Relationship Arrow (Visual Bridge) */}
              <div className="flex-shrink-0 text-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              {/* Supporting Numbers (Solution) */}
              <div className="flex gap-1.5 flex-wrap flex-1">
                {item.complementsNeeded.map(comp => {
                  const isPresent = item.complementsPresent.includes(comp);
                  return (
                    <div
                      key={comp}
                      className={cn(
                        "w-7 h-7 rounded flex items-center justify-center text-[12px] font-bold transition-all",
                        isPresent
                          ? "bg-white/10 border border-white/20 text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                          : "bg-transparent border border-dashed border-white/20 text-white/30"
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
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-8">
      {/* Header and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[15px] font-bold text-white/90 mb-1">
            🔄 Complementary Support · {label}
          </div>
          <div className="text-[12px] text-white/50">
            Which present numbers can support missing ones
          </div>
        </div>
        <div className="flex gap-3 text-[11px] font-bold bg-black/30 px-3 py-2.5 rounded-xl border border-white/5 shadow-inner">
          <span className="text-red-400">❌ Missing</span>
          <span className="text-white/20">|</span>
          <span className="text-yellow-400">⚠ Partial</span>
          <span className="text-white/20">|</span>
          <span className="text-green-400">✅ Supported</span>
        </div>
      </div>

      <div className="flex flex-col relative w-full">
        {renderGroup("❌ Missing (No Support)", missingSupport, 'none')}
        {renderGroup("⚠ Partial Support", partialSupport, 'partial')}
        {renderGroup("✅ Fully Supported", fullSupport, 'full')}
      </div>

      {present.includes(5) && (
        <div className="mt-6 p-4 bg-[var(--color-person-a)]/10 rounded-xl text-[12px] md:text-[13px] font-medium text-[var(--color-person-a)] border border-[var(--color-person-a)]/20 text-center max-w-2xl mx-auto">
          ✨ <strong className="text-white/90">Number 5 present:</strong> Universal support for all numbers - guides towards will, success & prosperity
        </div>
      )}
    </div>
  );
});
