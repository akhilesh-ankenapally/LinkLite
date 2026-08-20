import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 border-[2px]',
    md: 'w-4 h-4 border-[2px]',
    lg: 'w-6 h-6 border-[2.5px]',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-inherit opacity-90 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
};
