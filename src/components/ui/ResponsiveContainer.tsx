'use client';

import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const spacingClasses = {
  none: 'space-y-0',
  sm: 'space-y-3 sm:space-y-4',
  md: 'space-y-4 sm:space-y-6',
  lg: 'space-y-6 sm:space-y-8',
  xl: 'space-y-8 sm:space-y-10'
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '', 
  spacing = 'md' 
}) => {
  return (
    <div className={`w-full ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  subtitle,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">{title}</h1>
        {subtitle && (
          <p className="text-[var(--secondary)] mt-1 text-sm sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gridClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
};

const gapClasses = {
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8'
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className = ''
}) => {
  return (
    <div className={`grid ${gridClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddingClasses = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
  xl: 'p-6 sm:p-10'
};

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  padding = 'md'
}) => {
  return (
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};