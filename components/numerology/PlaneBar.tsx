import { memo } from 'react';

type PlanesData = {
  intellectual: number;
  emotional: number;
  practical: number;
  dominant: string;
  pct: {
    intellectual: number;
    emotional: number;
    practical: number;
  };
};

interface PlaneBarProps {
  planes: PlanesData;
  color?: string;
  planes2?: PlanesData;
  color2?: string;
}

export const PlaneBar = memo(function PlaneBar({ planes, color = '#60a5fa', planes2, color2 = '#f59e0b' }: PlaneBarProps) {
  const planeConfig = [
    { k: "intellectual" as const, label: "Thought" },
    { k: "emotional" as const, label: "Emotion" },
    { k: "practical" as const, label: "Action" },
  ];

  return (
    <div className="bg-white/[0.04] rounded-card p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-2.5">🧩 Plane Balance</div>

      {planeConfig.map(({ k, label }) => (
        <div key={k} className="mb-2">
          <div className="flex justify-between mb-0.5">
            <span className="text-[10px] text-white/45">{label}</span>
            <span className="text-[10px] font-bold" style={{ color }}>
              {planes[k]} · {planes.pct[k]}%
              {planes2 && <span style={{ color: color2 }}> / {planes2[k]} · {planes2.pct[k]}%</span>}
            </span>
          </div>
          <div className="h-[5px] rounded-full bg-white/[0.07] overflow-hidden mb-0.5">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${planes.pct[k]}%`, background: `linear-gradient(90deg,${color}88,${color})` }}
            />
          </div>
          {planes2 && (
            <div className="h-[5px] rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${planes2.pct[k]}%`, background: `linear-gradient(90deg,${color2}88,${color2})` }}
              />
            </div>
          )}
        </div>
      ))}

      <div className="text-[10px] text-white/30 mt-1">
        Dominant: <span className="text-white/90 font-bold capitalize">{planes.dominant}</span>
        {planes2 && <span> / <span className="text-white/90 font-bold capitalize">{planes2.dominant}</span></span>}
      </div>
    </div>
  );
});
