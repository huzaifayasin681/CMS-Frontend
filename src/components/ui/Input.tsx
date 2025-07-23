'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  
  const baseClasses = `
    px-3 py-2 
    bg-[var(--surface)] 
    border border-[var(--border)] 
    rounded-lg 
    text-[var(--foreground)] 
    placeholder-[var(--secondary)]
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent
    hover:border-[var(--primary)]
    ${error ? 'border-[var(--danger)] focus:ring-red-500' : ''}
    ${Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${fullWidth ? 'w-full' : ''}
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
        
        <input
          ref={ref}
          id={inputId}
          className={`${baseClasses} ${className}`}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-[var(--secondary)]" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-[var(--danger)]">{error}</p>
      )}
      
      {hint && !error && (
        <p className="mt-1.5 text-sm text-[var(--secondary)]">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';