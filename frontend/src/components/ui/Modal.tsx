import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, subtitle, children, size, maxWidth, footer }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actualSize = size || maxWidth || 'md';

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={cn(
          'w-full panel-bevel rounded-lg overflow-hidden bg-white shadow-2xl animate-in zoom-in-95 duration-150',
          sizeClasses[actualSize]
        )}
      >
        <div className="brushed-steel-header px-5 py-3.5 flex items-center justify-between border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-3.5 bg-emerald-600 rounded-xs"></div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-800">
                {title}
              </h2>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
