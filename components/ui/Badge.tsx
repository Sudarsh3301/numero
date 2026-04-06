import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'info', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-leaf-400/20 text-leaf-400 border-leaf-400/30',
    warning: 'bg-solar-500/20 text-solar-400 border-solar-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-mystic-purple-500/20 text-mystic-purple-400 border-mystic-purple-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full border',
        'text-xs font-semibold font-body',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
