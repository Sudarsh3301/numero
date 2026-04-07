import { memo } from 'react';
import type { RepetitionEffect } from '@/lib/numerology/types';
import { useNumerologyStore } from '@/store/useNumerologyStore';

interface RepetitionCardProps {
  effects: RepetitionEffect[];
  label?: string;
}

const severityColors = {
  ok: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  strength: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  exaggerated: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  negative: 'border-red-500/30 bg-red-500/10 text-red-300',
};

const severityLabels = {
  ok: 'Neutral',
  strength: 'Strength',
  exaggerated: 'Exaggerated',
  negative: 'Negative',
};

export const RepetitionCard = memo(function RepetitionCard({
  effects,
  label,
}: RepetitionCardProps) {
  const { selectedNumber } = useNumerologyStore();

  if (!effects || effects.length === 0) return null;

  // Filter if a number is selected
  const displayedEffects = selectedNumber
    ? effects.filter((e) => e.number === selectedNumber)
    : effects;

  if (displayedEffects.length === 0) return null;

  return (
    <div className="bg-black/20 rounded-3xl p-6 border border-white/10 flex flex-col gap-5 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl opacity-80">⚖️</span>
          Number Repetitions
        </h3>
        {label && <span className="text-xs text-white/40 uppercase tracking-widest">{label}</span>}
      </div>

      <p className="text-xs text-white/50 leading-relaxed -mt-2">
        Having multiple instances of the same number in your grid alters its energetic effect—ranging from great strength to negative exaggeration.
      </p>

      <div className="flex flex-col gap-3">
        {displayedEffects.map((eff) => (
          <div 
            key={eff.number}
            className={`p-4 rounded-xl border flex flex-col gap-2 ${severityColors[eff.severity]} transition-colors duration-300`}
          >
            <div className="flex justify-between items-center">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="bg-white/10 px-2 py-0.5 rounded text-sm">
                  {typeof window !== 'undefined' ? String(eff.number).repeat(eff.count) : eff.number}
                </span>
                <span>Number {eff.number}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-80 bg-black/20 px-2 py-1 rounded">
                {severityLabels[eff.severity]}
              </div>
            </div>
            <div className="text-sm opacity-90 leading-snug">
              {eff.effect}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
