import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'tactile' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all select-none disabled:opacity-50 disabled:pointer-events-none rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30';

    const variants = {
      primary:
        'tactile-emerald-btn font-semibold',
      secondary:
        'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 hover:border-slate-400 active:bg-slate-300 shadow-sm',
      outline:
        'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm',
      danger:
        'bg-red-600 text-white border border-red-700 hover:bg-red-700 active:bg-red-800 shadow-sm',
      tactile:
        'tactile-keypad-btn text-slate-800 font-mono font-bold',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs',
      md: 'h-9 px-3.5 text-sm',
      lg: 'h-11 px-5 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
