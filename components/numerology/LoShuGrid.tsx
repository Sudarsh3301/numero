import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

const GRID_POS = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
const flatten2D = (arr: any[][]) => [].concat(...arr);

interface LoShuGridProps {
  counts: Record<number, number>;
  color?: string;
  variant?: 'solar' | 'mystic' | 'leaf';
  onCellHover?: (num: number | null) => void;
  onCellClick?: (num: number) => void;
}

export const LoShuGrid = memo(function LoShuGrid({
  counts,
  color = "#a855f7",
  variant = 'mystic',
  onCellHover,
  onCellClick
}: LoShuGridProps) {
  const variantClasses = {
    solar: 'shadow-glow-solar',
    mystic: 'shadow-glow-mystic',
    leaf: 'shadow-glow-leaf',
  };

  return (
    <div
      className="grid grid-cols-3 gap-2 w-fit mx-auto animate-float"
      onMouseLeave={() => onCellHover?.(null)}
    >
      {flatten2D(GRID_POS).map(n => {
        const c = counts[n] || 0;
        const isMissing = c === 0;
        const isPresent = c === 1;
        const isStrong = c > 1;

        return (
          <div
            key={n}
            onMouseEnter={() => onCellHover?.(n)}
            onClick={() => onCellClick?.(n)}
            className={cn(
              'w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-xl cursor-pointer relative',
              'flex flex-col items-center justify-center',
              'transition-all duration-300',
              'hover:scale-105',

              isMissing && [
                'bg-black/20',
                'border border-dashed border-white/20',
                'opacity-60 hover:opacity-100'
              ],

              isPresent && [
                'backdrop-blur-sm',
                'border border-solid',
                'border-opacity-50'
              ],

              isStrong && [
                'backdrop-blur-md',
                'border-[2px] border-solid',
                variantClasses[variant]
              ]
            )}
            style={!isMissing ? {
              background: `${color}${Math.min(15 + c * 20, 60).toString(16).padStart(2, "0")}`,
              borderColor: isStrong ? `${color}` : `${color}88`,
              boxShadow: isStrong ? `0 0 20px ${color}66, inset 0 0 12px ${color}33` : `0 0 10px ${color}22`,
            } : undefined}
          >
            <div className="absolute top-1.5 left-2.5 text-[10px] md:text-[12px] text-white/40 font-mono tracking-widest">{n}</div>
            <div className={cn(
              'font-retro tracking-wider flex items-center justify-center mt-2 md:mt-3',
              isStrong ? 'text-[18px] md:text-[22px] font-black text-white drop-shadow-md' :
                isPresent ? 'text-[16px] md:text-[20px] font-bold text-white/90' :
                  'text-[18px] md:text-[22px] font-bold text-white/10'
            )}>
              {!isMissing ? Array(Math.min(c, 4)).fill(n).join("") : "·"}
            </div>
          </div>
        );
      })}
    </div>
  );
});
