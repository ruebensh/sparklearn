import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<React.ComponentProps<"button">, "type"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: "submit" | "reset" | "button";
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-amber)]';
  
  const variants = {
    primary: 'bg-[var(--color-amber)] text-[var(--color-navy)] hover:bg-[var(--color-coral)] hover:text-white',
    secondary: 'bg-[var(--color-coral)] text-white hover:bg-[var(--color-amber)] hover:text-[var(--color-navy)]',
    outline: 'border-2 border-[var(--color-coral)] text-[var(--color-coral)] hover:bg-[var(--color-coral)] hover:text-white',
    ghost: 'text-[var(--color-muted)] hover:text-white hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
