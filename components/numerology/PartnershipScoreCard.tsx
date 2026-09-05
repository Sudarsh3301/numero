import { memo, useMemo } from 'react';
import { getPlanetRelationship } from '@/lib/numerology/planets';

interface PartnershipScoreCardProps {
  m1: any;
  m2: any;
}

export const PartnershipScoreCard = memo(function PartnershipScoreCard({
  m1,
  m2,
}: PartnershipScoreCardProps) {
  const comp = useMemo(() => {
    let score = 0;
    const breakdown = [];
    
    // 1. Driver Relationship
    const driverRel = getPlanetRelationship(m1.driver, m2.driver);
    if (driverRel === 'friend') {
      score += 40;
      breakdown.push({ label: "Driver Harmony (Friendly)", value: "+40%" });
    } else if (driverRel === 'neutral') {
      score += 30;
      breakdown.push({ label: "Driver Harmony (Neutral)", value: "+30%" });
    } else {
      breakdown.push({ label: "Driver Conflict (Anti/Enemy)", value: "0%" });
    }
    
    // 2. Gender Advantage (Male driver stronger) - simplified, assuming 'driver' value as strength
    // This is a placeholder since we don't know absolute planet strength easily, but we'll add 10% base for shared drivers
    if (m1.driver === m2.driver) {
      score += 10;
      breakdown.push({ label: "Shared Driver Match", value: "+10%" });
    }
    
    // 3. Difficult Combinations (2/9, 2/4, 4/4/8/8)
    const combo = [m1.driver, m2.driver].sort().join('/');
    if (combo === '2/9' || combo === '2/4' || combo === '4/4' || combo === '8/8') {
      // the rule says it holds 20% weight, meaning it reduces or caps it? We'll subtract 10 for warning
      breakdown.push({ label: "Challenging Driver Pair", value: "-10%" });
      score -= 10;
    }

    // 4. Exchanging missing numbers
    let exchanges = 0;
    const m1Needs = m1.missing;
    const m2Needs = m2.missing;
    const m1Has = m1.present.concat(m1.repeated);
    const m2Has = m2.present.concat(m2.repeated);

    m1Needs.forEach((n: number) => {
      if (m2Has.includes(n)) exchanges++;
    });
    m2Needs.forEach((n: number) => {
      if (m1Has.includes(n)) exchanges++;
    });

    if (exchanges > 0) {
      const added = Math.min(exchanges * 10, 40); // Cap at 40
      score += added;
      breakdown.push({ label: `Number Exchanges (${exchanges})`, value: `+${added}%` });
    }

    // 5. Success/Family numbers
    const m1Has5 = m1Has.includes(5);
    const m2Has5 = m2Has.includes(5);
    const m1Has6 = m1Has.includes(6);
    const m2Has6 = m2Has.includes(6);

    if (m1Has5 && m2Has5) { score += 5; breakdown.push({ label: "Both have Number 5", value: "+5%" }); }
    else if (m1Has5 || m2Has5) { score += 5; breakdown.push({ label: "One has Number 5", value: "+5%" }); }

    if (m1Has6 && m2Has6) { score += 5; breakdown.push({ label: "Both have Number 6", value: "+5%" }); }
    else if (m1Has6 || m2Has6) { score += 5; breakdown.push({ label: "One has Number 6", value: "+5%" }); }

    return { 
      score: Math.max(0, Math.min(100, score)), 
      breakdown, 
      exchanges, 
      driverRel,
      missingBoth: m1Needs.filter((n: number) => m2Needs.includes(n)),
    };
  }, [m1, m2]);

  const scoreColor = comp.score >= 70 ? 'text-emerald-400' : comp.score >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreText = comp.score >= 75 ? 'Excellent' : comp.score >= 65 ? 'Best' : comp.score >= 55 ? 'Good' : comp.score >= 50 ? 'Average' : 'Not Compatible';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-4 font-sans">
      <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden backdrop-blur-md">
        
        {/* SCORE GAUGE */}
        <div className="flex flex-col items-center justify-center shrink-0 w-28 h-28 md:w-48 md:h-48 rounded-full border-4 md:border-[6px] border-white/5 relative">
          <div className="absolute inset-0 rounded-full border-t-4 border-l-4 md:border-t-[6px] md:border-l-[6px] opacity-70"
            style={{
              borderColor: comp.score >= 70 ? '#34d399' : comp.score >= 50 ? '#fbbf24' : '#f87171',
              transform: `rotate(${comp.score * 3.6 - 135}deg)`, transition: 'transform 1s ease-out'
            }}
          />
          <div className={`text-3xl md:text-5xl font-black ${scoreColor} drop-shadow-lg`}>{comp.score}%</div>
          <div className="text-xs md:text-sm font-bold text-white/60 tracking-wider mt-1 uppercase">{scoreText}</div>
        </div>

        {/* COMPARISON DETAILS */}
        <div className="flex flex-col flex-1 w-full gap-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>💞</span> Partnership Match
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* BREAKDOWN */}
            <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
              <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold">Calculation Breakdown</h4>
              <ul className="text-sm flex flex-col gap-2">
                {comp.breakdown.map((b, i) => (
                  <li key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                    <span className="text-white/80">{b.label}</span>
                    <span className="font-bold text-white">{b.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SYNERGY & WARNINGS */}
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                <h4 className="text-xs text-emerald-300 uppercase tracking-widest font-bold mb-2">Strengths</h4>
                <p className="text-sm text-emerald-100/80 leading-snug">
                  You complete {comp.exchanges} missing numbers for each other. 
                  {comp.driverRel === 'friend' && " Your Driver numbers are natural friends, making collaboration easy."}
                </p>
              </div>

              {comp.missingBoth.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
                  <h4 className="text-xs text-amber-300 uppercase tracking-widest font-bold mb-2">Mutual Gaps</h4>
                  <p className="text-sm text-amber-100/80 leading-snug">
                    Both of you are missing: <span className="font-bold text-white bg-black/30 px-1.5 py-0.5 rounded">{comp.missingBoth.join(', ')}</span>.
                    You may both struggle in these areas without external support.
                  </p>
                </div>
              )}
              
              {comp.driverRel !== 'friend' && comp.driverRel !== 'neutral' && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl">
                  <h4 className="text-xs text-red-300 uppercase tracking-widest font-bold mb-2">Friction Alert</h4>
                  <p className="text-sm text-red-100/80 leading-snug">
                    Your Driver planets are adverse. This will require high emotional maturity and constant compromise.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
});
