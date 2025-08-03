'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gradient';
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  variant = 'spinner'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const colors = {
    primary: 'border-[var(--primary)]',
    secondary: 'border-[var(--secondary)]',
    white: 'border-white',
    gradient: 'border-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]'
  };
  
  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'} bg-[var(--primary)] rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }
  
  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizes[size]} bg-[var(--primary)] rounded-full ${className}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      />
    );
  }
  
  return (
    <motion.div
      className={`
        ${sizes[size]}
        border-2 
        ${color === 'gradient' ? '' : colors[color]}
        ${color === 'gradient' ? 'rounded-full' : 'border-t-transparent rounded-full'}
        ${color === 'gradient' ? 'gradient-primary' : ''}
        ${className}
      `}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {color === 'gradient' && (
        <div className="w-full h-full bg-[var(--background)] rounded-full m-0.5" />
      )}
    </motion.div>
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
            skeleton-enhanced
            rounded-lg
            ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
};