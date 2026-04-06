import { memo } from 'react';
import type { Remedy } from '@/lib/numerology/types';

interface RemediesCardProps {
  remedies: Remedy[];
  label: string;
}

export const RemediesCard = memo(function RemediesCard({ remedies, label }: RemediesCardProps) {
  const byFreq: Record<string, Remedy[]> = { daily: [], weekly: [], monthly: [] };
  remedies.forEach(r => {
    if (r.frequency === 'daily' && byFreq.daily.length < 2) byFreq.daily.push(r);
    else if (r.frequency === 'weekly' && byFreq.weekly.length < 2) byFreq.weekly.push(r);
    else if (r.frequency === 'monthly' && byFreq.monthly.length < 1) byFreq.monthly.push(r);
  });

  return (
    <div className="bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-1">
        🙏 Top Remedies · {label}
      </div>
      <div className="text-[9px] text-white/35 mb-2">Based on missing numbers</div>

      {Object.entries(byFreq).map(([freq, items]) => (
        items.length > 0 && (
          <div key={freq} className="mb-2">
            <div className="text-[9px] text-white/40 mb-0.5 capitalize">{freq}:</div>
            {items.map((remedy, i) => (
              <div key={i} className="text-[10px] text-blue-400 mb-0.5 pl-2">
                • {remedy.action}
              </div>
            ))}
          </div>
        )
      ))}
    </div>
  );
});
