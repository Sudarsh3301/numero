import { memo } from 'react';

interface PlaneBarProps {
  planes: {
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
}

export const PlaneBar = memo(function PlaneBar({ planes }: PlaneBarProps) {
  const planeConfig = [
    { k: "intellectual" as const, label: "Thought", c: "#60a5fa" },
    { k: "emotional" as const, label: "Emotion", c: "#f472b6" },
    { k: "practical" as const, label: "Action", c: "#34d399" }
  ];

  return (
    <div className="bg-white/[0.04] rounded-organic p-3.5">
      <div className="text-[12px] font-bold text-white/90 mb-2.5">🧩 Plane Balance</div>

      {planeConfig.map(({ k, label, c }) => (
        <div key={k} className="mb-2">
          <div className="flex justify-between mb-0.5">
            <span className="text-[10px] text-white/45">{label}</span>
            <span className="text-[10px] font-bold" style={{ color: c }}>
              {planes[k]} · {planes.pct[k]}%
            </span>
          </div>
          <div className="h-[5px] rounded-full bg-white/[0.07] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${planes.pct[k]}%`,
                background: `linear-gradient(90deg,${c}88,${c})`
              }}
            />
          </div>
        </div>
      ))}

      <div className="text-[10px] text-white/30 mt-1">
        Dominant: <span className="text-white/90 font-bold capitalize">{planes.dominant}</span>
      </div>
    </div>
  );
});
