import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  headerTitle?: string;
  headerAction?: React.ReactNode;
}

export function Card({ className, headerTitle, headerAction, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'panel-bevel rounded-lg overflow-hidden bg-white text-slate-900 shadow-xs border border-slate-300',
        className
      )}
      {...props}
    >
      {headerTitle && (
        <div className="brushed-steel-header px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-600 rounded-xs"></span>
            {headerTitle}
          </h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-4 py-3 border-b border-slate-200 bg-slate-50/70', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xs font-mono font-bold uppercase tracking-wider text-slate-800', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}
