import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'amber' | 'coral' | 'navy' | 'outline';
  className?: string;
}

export function Badge({ children, className, variant = 'amber', ...props }: BadgeProps) {
  const variants = {
    amber: 'bg-[var(--color-amber)] text-[var(--color-navy)]',
    coral: 'bg-[var(--color-coral)] text-white',
    navy: 'bg-[var(--color-navy-light)] text-white border border-white/10',
    outline: 'bg-transparent border border-[var(--color-amber)] text-[var(--color-amber)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
