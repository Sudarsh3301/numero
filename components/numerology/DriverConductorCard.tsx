import { memo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';

interface DriverConductorCardProps {
  m: any;
  label: string;
  color: string;
}

export const DriverConductorCard = memo(function DriverConductorCard({
  m,
  label,
  color
}: DriverConductorCardProps) {
  const strengthColor =
    m.dcProfile.strength >= 4 ? "#4ade80" :
    m.dcProfile.strength >= 3 ? "#60a5fa" :
    m.dcProfile.strength >= 2 ? "#f59e0b" : "#f87171";

  return (
    <div
      className="rounded-organic p-3.5 mb-3 border-[1.5px]"
      style={{
        background: `linear-gradient(135deg,${color}18,rgba(255,255,255,0.03))`,
        borderColor: `${color}44`
      }}
    >
      <div className="text-[10px] text-white/40 mb-2 text-center">{label}</div>

      {/* Driver and Conductor Numbers */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 text-center">
          <div className="text-[9px] text-white/40 mb-1">DRIVER</div>
          <div
            className="w-[60px] h-[60px] mx-auto rounded-xl flex items-center justify-center text-[28px] font-bold mb-1.5"
            style={{
              background: `linear-gradient(135deg,${color},${color}88)`,
              boxShadow: `0 0 16px ${color}55`
            }}
          >
            {m.driver}
          </div>
          <div className="text-[11px] font-bold" style={{ color }}>{m.rulingPlanet.name}</div>
          <div className="text-[9px] text-white/35">{m.rulingPlanet.title}</div>
        </div>

        <div className="flex items-center text-[20px] text-white/20">+</div>

        <div className="flex-1 text-center">
          <div className="text-[9px] text-white/40 mb-1">CONDUCTOR</div>
          <div
            className="w-[60px] h-[60px] mx-auto rounded-xl flex items-center justify-center text-[28px] font-bold border-[1.5px] mb-1.5"
            style={{
              background: `linear-gradient(135deg,${color}77,${color}55)`,
              borderColor: `${color}66`
            }}
          >
            {m.conductor}
          </div>
          <div className="text-[11px] font-bold" style={{ color }}>{m.conductorPlanet.name}</div>
          <div className="text-[9px] text-white/35">{m.conductorPlanet.title}</div>
        </div>
      </div>

      {/* DC Combination Details */}
      <div className="bg-white/5 rounded-lg p-2.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-white/50">Combination Strength</span>
          <span
            className="text-[14px] font-bold"
            style={{ color: strengthColor }}
          >
            {m.dcProfile.strength ? `${m.dcProfile.strength}/5` : "?"}
          </span>
        </div>
        <div className="text-[12px] text-white/90 font-bold mb-1">{m.dcProfile.affect}</div>
        <div className="text-[10px] text-white/45">
          Best for: {m.dcProfile.professions.slice(0, 3).join(", ")}
        </div>
        {m.dcProfile.warnings && (
          <div className="mt-1.5 p-1.5 bg-red-500/10 rounded-md text-[9px] text-red-300">
            ⚠️ {m.dcProfile.warnings}
          </div>
        )}
      </div>

      {/* Master Number if present */}
      {m.masterNumber.isMaster && (
        <div className="mt-2.5 p-2.5 bg-[var(--color-person-a)]/15 border-[1.5px] border-[var(--color-person-a)]/30 rounded-lg">
          <div className="text-[11px] text-[var(--color-person-a)] font-bold mb-0.5">
            ✨ Master Number {m.masterNumber.number} ({m.masterNumber.strength}% strength)
          </div>
          <div className="text-[9px] text-white/50">
            {m.masterNumber.number === 11 ? "Spiritual messenger - intuitive and inspiring" :
             m.masterNumber.number === 22 ? "Master builder - dreams into reality" :
             "Master teacher - ancient wisdom"}
          </div>
        </div>
      )}

      {/* Karmic Numbers if present */}
      {m.karmicNumbers.hasKarmic && (
        <div className="mt-2.5 p-2.5 bg-red-500/10 border-[1.5px] border-red-400/30 rounded-lg">
          <div className="text-[11px] text-red-400 font-bold mb-1">
            ⚡ Karmic Debt: {m.karmicNumbers.numbers.join(", ")}
          </div>
          {m.karmicNumbers.meanings.slice(0, 1).map((meaning, i) => (
            <div key={i} className="text-[9px] text-white/50 leading-snug">{meaning}</div>
          ))}
        </div>
      )}
    </div>
  );
});
