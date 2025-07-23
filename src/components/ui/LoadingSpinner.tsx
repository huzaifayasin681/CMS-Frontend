'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const colors = {
    primary: 'border-[var(--primary)]',
    secondary: 'border-[var(--secondary)]',
    white: 'border-white'
  };
  
  return (
    <div
      className={`
        ${sizes[size]}
        border-2 
        ${colors[color]}
        border-t-transparent
        rounded-full 
        animate-spin
        ${className}
      `}
    />
  );
};

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  lines = 1
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`
            h-4 
            skeleton 
            rounded
            ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
};