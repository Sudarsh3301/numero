import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

const GRID_POS = [[4,9,2],[3,5,7],[8,1,6]];
const flatten2D = (arr: any[][]) => [].concat(...arr);

interface LoShuGridProps {
  counts: Record<number, number>;
  color?: string;
  variant?: 'solar' | 'mystic' | 'leaf';
}

export const LoShuGrid = memo(function LoShuGrid({
  counts,
  color = "#a855f7",
  variant = 'mystic'
}: LoShuGridProps) {
  const variantClasses = {
    solar: 'shadow-glow-solar',
    mystic: 'shadow-glow-mystic',
    leaf: 'shadow-glow-leaf',
  };

  return (
    <div className="grid grid-cols-3 gap-1.5 w-48 mx-auto animate-float">
      {flatten2D(GRID_POS).map(n => {
        const c = counts[n] || 0;
        const isActive = c > 0;

        return (
          <div
            key={n}
            className={cn(
              'w-[58px] h-[58px] rounded-xl',
              'flex flex-col items-center justify-center',
              'border-[1.5px] transition-all duration-300',
              'hover:scale-105',
              isActive ? [
                'backdrop-blur-sm',
                variantClasses[variant],
                'border-opacity-50'
              ] : [
                'bg-white/[0.03]',
                'border-white/[0.08]'
              ]
            )}
            style={isActive ? {
              background: `${color}${Math.min(15 + c * 18, 55).toString(16).padStart(2, "0")}`,
              borderColor: `${color}88`,
              boxShadow: `0 0 10px ${color}44`,
            } : undefined}
          >
            <div className="text-[9px] text-white/30 mb-0.5 font-mono">{n}</div>
            <div className={cn(
              'font-retro font-bold tracking-wider',
              c > 2 ? 'text-[11px]' : 'text-[15px]',
              isActive ? 'text-white/90' : 'text-white/10'
            )}>
              {isActive ? Array(Math.min(c, 4)).fill(n).join("") : "·"}
            </div>
          </div>
        );
      })}
    </div>
  );
});
