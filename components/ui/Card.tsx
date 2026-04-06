import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'solar' | 'leaf' | 'mystic';
  glow?: boolean;
  pattern?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow = false, pattern = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white/5 border-white/10',
      solar: 'bg-gradient-to-br from-solar-500/10 to-transparent border-solar-500/30',
      leaf: 'bg-gradient-to-br from-leaf-400/10 to-transparent border-leaf-400/30',
      mystic: 'bg-gradient-to-br from-mystic-purple-500/10 to-transparent border-mystic-purple-500/30',
    };

    const glowClasses = {
      default: 'shadow-lg',
      solar: 'shadow-glow-solar',
      leaf: 'shadow-glow-leaf',
      mystic: 'shadow-glow-mystic',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'backdrop-blur-sm border rounded-organic',
          'transition-all duration-300 hover:scale-[1.01]',
          variants[variant],
          glow && glowClasses[variant],
          pattern && 'pattern-organic',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 pb-2', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-retro text-lg font-bold text-white/90', className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 pt-2', className)} {...props} />
);
