'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glass = false,
  hover = false,
  padding = 'md',
  onClick
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const baseClasses = `
    rounded-xl 
    border border-[var(--border)]
    transition-all duration-200
    ${glass ? 'glass' : 'bg-[var(--surface)] shadow-sm'}
    ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${paddingClasses[padding]}
  `;
  
  const Component = onClick ? motion.div : 'div';
  
  return (
    <Component
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  );
};