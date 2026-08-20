import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-2.5',
    md: 'p-3.5',
    lg: 'p-5',
  };

  const variantStyles = {
    default:
      'bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
    subtle:
      'bg-light-secondary dark:bg-[#151e33] border border-light-border/80 dark:border-dark-border/80',
    outline:
      'bg-transparent border border-dashed border-light-border dark:border-dark-border',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl transition-colors',
          paddingStyles[padding],
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
