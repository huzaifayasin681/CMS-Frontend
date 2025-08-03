'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  label?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  icon: Icon,
  iconPosition = 'left',
  error,
  hint,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const [isFocused, setIsFocused] = useState(false);
  
  const baseClasses = `
    px-4 py-3
    bg-[var(--surface)] 
    border border-[var(--border)] 
    rounded-xl
    text-[var(--foreground)] 
    placeholder-[var(--secondary)]
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent focus:shadow-lg
    hover:border-[var(--primary)] hover:shadow-md
    ${error ? 'border-[var(--danger)] focus:ring-red-500' : ''}
    ${Icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : ''}
    ${fullWidth ? 'w-full' : ''}
    ${isFocused ? 'shadow-glow' : ''}
  `;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-[var(--secondary)]" />
          </div>
        )}
        
        <motion.input
          ref={ref}
          id={inputId}
          className={`${baseClasses} ${className}`}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-[var(--secondary)]" />
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p 
            className="mt-2 text-sm text-[var(--danger)] flex items-center gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="w-4 h-4 rounded-full bg-[var(--danger)] flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </span>
            {error}
          </motion.p>
        )}
        
        {hint && !error && (
          <motion.p 
            className="mt-2 text-sm text-[var(--secondary)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';