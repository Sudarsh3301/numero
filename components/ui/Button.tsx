import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'solar' | 'leaf';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-mystic text-white shadow-glow-mystic hover:shadow-glow-mystic hover:scale-105',
      secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/15',
      solar: 'bg-gradient-solar text-white shadow-glow-solar hover:shadow-glow-solar hover:scale-105',
      leaf: 'bg-gradient-leaf text-white shadow-glow-leaf hover:scale-105',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'rounded-bio font-retro font-bold',
          'transition-all duration-300',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
          'focus:outline-none focus:ring-2 focus:ring-solar-500/50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
