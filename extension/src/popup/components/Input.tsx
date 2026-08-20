import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightAction,
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={twMerge('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label className="text-xs font-medium text-light-muted dark:text-dark-muted select-none">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-2.5 flex items-center justify-center text-light-muted dark:text-dark-muted pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full h-9 px-3 text-xs bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text border rounded-lg transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
                leftIcon ? 'pl-8' : 'pl-3',
                rightAction ? 'pr-9' : 'pr-3',
                error
                  ? 'border-light-danger dark:border-dark-danger focus:ring-light-danger'
                  : 'border-light-border dark:border-dark-border',
                className
              )
            )}
            {...props}
          />

          {rightAction && (
            <div className="absolute right-2 flex items-center justify-center">
              {rightAction}
            </div>
          )}
        </div>

        {error && (
          <span className="text-[11px] text-light-danger dark:text-dark-danger leading-tight">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
