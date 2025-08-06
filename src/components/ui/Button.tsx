'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
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
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible rounded-xl border relative overflow-hidden';
  
  const variants = {
    primary: 'gradient-primary text-white border-transparent shadow-md hover:shadow-xl hover:shadow-glow btn-glow',
    secondary: 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border-[var(--border)] shadow-sm hover:shadow-lg',
    outline: 'bg-transparent hover:bg-[var(--surface)] text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-[var(--surface)] text-[var(--foreground)] border-transparent hover:shadow-md',
    danger: 'bg-[var(--danger)] hover:bg-red-600 text-white border-transparent shadow-md hover:shadow-xl'
  };
  
  const sizes = {
    sm: 'px-3 sm:px-4 py-2 text-sm gap-1.5 sm:gap-2 min-h-[36px] text-xs sm:text-sm',
    md: 'px-4 sm:px-6 py-2.5 sm:py-3 text-sm gap-2 sm:gap-2.5 min-h-[40px] sm:min-h-[44px]',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base gap-2.5 sm:gap-3 min-h-[48px] sm:min-h-[52px]'
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <motion.button
      ref={ref}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover-lift'}
        ${className}
      `}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...props}
    >
      {loading ? (
        <motion.div 
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <motion.div
              initial={{ x: -2, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
            </motion.div>
          )}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {children}
          </motion.span>
          {Icon && iconPosition === 'right' && (
            <motion.div
              initial={{ x: 2, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
            </motion.div>
          )}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';