import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'emerald'
    | 'slate'
    | 'amber'
    | 'cyan'
    | 'red'
    | 'outline'
    | 'purple'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'neutral';
}

export function Badge({ className, variant = 'slate', children, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    slate: 'bg-slate-100 text-slate-700 border-slate-300',
    neutral: 'bg-slate-100 text-slate-700 border-slate-300',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    warning: 'bg-amber-50 text-amber-800 border-amber-300',
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-300',
    info: 'bg-cyan-50 text-cyan-800 border-cyan-300',
    red: 'bg-red-50 text-red-800 border-red-300',
    danger: 'bg-red-50 text-red-800 border-red-300',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    purple: 'bg-purple-50 text-purple-800 border-purple-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-semibold border rounded-sm',
        variants[variant] || variants.slate,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
