import { memo } from 'react';
import { getPlanetDay } from '@/lib/numerology/planet-days';

interface PlanetDayCardProps {
  driver: number;
  conductor: number;
  driverPlanet: string;
  conductorPlanet: string;
  label: string;
}

export const PlanetDayCard = memo(function PlanetDayCard({
  driver,
  conductor,
  driverPlanet,
  conductorPlanet,
  label
}: PlanetDayCardProps) {
  const driverDay = getPlanetDay(driver);
  const conductorDay = getPlanetDay(conductor);

  return (
    <div className="bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-2">
        📅 Favorable Days & Colors · {label}
      </div>

      <div className="mb-2.5 p-2.5 bg-mystic-purple-500/10 rounded-lg">
        <div className="text-[11px] text-mystic-purple-400 font-bold mb-1">
          Driver {driver} ({driverPlanet}) — {driverDay.day}
        </div>
        <div className="flex gap-2 text-[10px]">
          <div className="flex-1">
            <span className="text-white/40">Use: </span>
            <span className="text-leaf-400">{driverDay.colorsToUse.join(", ")}</span>
          </div>
          {driverDay.colorsToAvoid.length > 0 && (
            <div className="flex-1">
              <span className="text-white/40">Avoid: </span>
              <span className="text-red-400">{driverDay.colorsToAvoid.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-2.5 bg-blue-500/10 rounded-lg">
        <div className="text-[11px] text-blue-400 font-bold mb-1">
          Conductor {conductor} ({conductorPlanet}) — {conductorDay.day}
        </div>
        <div className="flex gap-2 text-[10px]">
          <div className="flex-1">
            <span className="text-white/40">Use: </span>
            <span className="text-leaf-400">{conductorDay.colorsToUse.join(", ")}</span>
          </div>
          {conductorDay.colorsToAvoid.length > 0 && (
            <div className="flex-1">
              <span className="text-white/40">Avoid: </span>
              <span className="text-red-400">{conductorDay.colorsToAvoid.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
