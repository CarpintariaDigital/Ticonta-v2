import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
  prefixSymbol?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, mono = false, prefixSymbol, helperText, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {prefixSymbol && (
            <span className="absolute left-3 text-slate-400 font-mono text-xs select-none">
              {prefixSymbol}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-xs',
              mono && 'font-mono tracking-tight',
              prefixSymbol && 'pl-9',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p className="text-[11px] text-slate-500">{helperText}</p>
        )}
        {error && (
          <p className="text-[11px] text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
