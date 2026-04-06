import { memo } from 'react';
import type { HealthProfile } from '@/lib/numerology/types';

interface HealthCardProps {
  health: HealthProfile;
  age: number;
  label: string;
}

export const HealthCard = memo(function HealthCard({ health, age, label }: HealthCardProps) {
  const governedBy = age < 40 ? "Driver" : "Conductor";

  return (
    <div className="bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-1">
        🏥 Health Profile · {label}
      </div>
      <div className="text-[9px] text-white/35 mb-2">
        Age {age} — Governed by {governedBy} ({health.planet})
      </div>

      <div className="mb-2">
        <div className="text-[10px] text-white/50 mb-0.5">Likely Health Concerns:</div>
        {health.issues.slice(0, 3).map((issue, i) => (
          <div key={i} className="text-[10px] text-solar-500 mb-0.5">• {issue}</div>
        ))}
      </div>

      <div className="bg-leaf-400/8 rounded-lg p-2">
        <div className="text-[9px] text-leaf-400 font-bold mb-0.5">Lifestyle Advice:</div>
        <div className="text-[9px] text-white/60 leading-relaxed">
          {health.lifestyle.slice(0, 150)}...
        </div>
      </div>
    </div>
  );
});
