import React from 'react';
import { motion } from 'motion/react';
import { cn } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
  hoverLift?: boolean;
  className?: string;
}

export function Card({ children, className, glass = true, hoverLift = true, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' } : {}}
      className={cn(
        'rounded-2xl p-8 border transition-all duration-300',
        glass ? 'bg-white/5 backdrop-blur-md border-white/10' : 'bg-[var(--color-navy-light)] border-transparent',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
