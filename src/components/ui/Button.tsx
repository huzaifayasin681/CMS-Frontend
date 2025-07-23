'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring rounded-lg border';
  
  const variants = {
    primary: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-transparent shadow-sm hover:shadow',
    secondary: 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border-[var(--border)] shadow-sm hover:shadow',
    outline: 'bg-transparent hover:bg-[var(--surface)] text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
    ghost: 'bg-transparent hover:bg-[var(--surface)] text-[var(--foreground)] border-transparent',
    danger: 'bg-[var(--danger)] hover:bg-red-600 text-white border-transparent shadow-sm hover:shadow'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <motion.div whileTap={!isDisabled ? { scale: 0.98 } : undefined}>
      <button
        ref={ref}
        className={`
          ${baseClasses}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
          </>
        )}
      </button>
    </motion.div>
  );
});

Button.displayName = 'Button';