import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'info', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    danger: 'bg-danger/20 text-danger border-danger/30',
    info: 'bg-[var(--color-person-b)]/20 text-[var(--color-person-b)] border-[var(--color-person-b)]/30',
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
