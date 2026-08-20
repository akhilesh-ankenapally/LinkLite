import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium select-none rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-7',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-base px-4 py-2.5 gap-2.5 h-11',
  };

  const variantStyles = {
    primary:
      'bg-light-accent dark:bg-dark-accent text-white hover:bg-light-accentHover dark:hover:bg-dark-accentHover focus:ring-light-accent dark:focus:ring-dark-accent shadow-sm',
    secondary:
      'bg-light-secondary dark:bg-dark-card text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-gray-800/80 focus:ring-gray-400 dark:focus:ring-gray-600',
    danger:
      'bg-light-danger dark:bg-dark-danger text-white hover:bg-red-700 dark:hover:bg-red-600 focus:ring-light-danger shadow-sm',
    ghost:
      'bg-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800/60 focus:ring-gray-400',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />
      ) : (
        <>
          {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
