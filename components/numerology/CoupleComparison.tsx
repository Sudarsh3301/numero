import React from 'react';
import { PERSON_COLORS } from '@/lib/theme';
import { LoShuGrid } from './LoShuGrid';
import { PlaneBar } from './PlaneBar';

interface CoupleComparisonProps {
  m1: any;
  m2: any;
  label1?: string;
  label2?: string;
}

export default function CoupleComparison({ m1, m2, label1 = 'Person 1', label2 = 'Person 2' }: CoupleComparisonProps) {
  return (
    <div className="w-full space-y-6">
      {/* Lo Shu Grids side by side */}
      <section className="flex flex-col md:flex-row gap-6 justify-center items-start">
        <div className="flex-1 text-center">
          <h3 className="text-sm font-semibold mb-2" style={{ color: PERSON_COLORS.p1 }}>{label1}</h3>
          <LoShuGrid counts={m1.counts} color={PERSON_COLORS.p1} cellSize={56} />
        </div>
        <div className="flex-1 text-center">
          <h3 className="text-sm font-semibold mb-2" style={{ color: PERSON_COLORS.p2 }}>{label2}</h3>
          <LoShuGrid counts={m2.counts} color={PERSON_COLORS.p2} cellSize={56} />
        </div>
      </section>

      {/* Missing / Strong numbers */}
      <section className="flex flex-col md:flex-row gap-4">
        {[
          { profile: m1, color: PERSON_COLORS.p1, label: label1 },
          { profile: m2, color: PERSON_COLORS.p2, label: label2 },
        ].map(({ profile, color, label }) => (
          <div key={label} className="flex-1 rounded-card border border-white/10 p-4">
            <h4 className="text-xs font-semibold mb-2" style={{ color }}>{label}</h4>
            <p className="text-xs text-white/50">
              Missing: <span className="text-white/80">{profile.missing?.join(', ') || '—'}</span>
            </p>
            <p className="text-xs text-white/50 mt-1">
              Strong: <span className="text-white/80">{profile.repeated?.join(', ') || '—'}</span>
            </p>
          </div>
        ))}
      </section>

      {/* Plane Balance dual-bar */}
      <section>
        <PlaneBar
          planes={m1.planes}
          color={PERSON_COLORS.p1}
          planes2={m2.planes}
          color2={PERSON_COLORS.p2}
        />
        <div className="flex gap-4 mt-2 text-xs text-white/50 px-1">
          <span style={{ color: PERSON_COLORS.p1 }}>■ {label1}</span>
          <span style={{ color: PERSON_COLORS.p2 }}>■ {label2}</span>
        </div>
      </section>

      {/* Personal Year comparison */}
      <section className="flex flex-col md:flex-row gap-4">
        {[
          { profile: m1, color: PERSON_COLORS.p1, label: label1 },
          { profile: m2, color: PERSON_COLORS.p2, label: label2 },
        ].map(({ profile, color, label }) => (
          <div key={label} className="flex-1 rounded-card border border-white/10 p-4 text-center">
            <h4 className="text-xs font-semibold mb-1" style={{ color }}>{label}</h4>
            <p className="text-xs text-white/40">Personal Year</p>
            <p className="text-3xl font-bold mt-1" style={{ color, fontFamily: 'var(--font-newsreader)' }}>
              {profile.personalYear ?? '—'}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
