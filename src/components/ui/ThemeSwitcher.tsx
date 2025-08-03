'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Zap, Waves } from 'lucide-react';
import { useThemeStore } from '@/lib/theme';
import { Button } from './Button';

const themeIcons = {
  light: Sun,
  dark: Moon,
  colorful: Palette,
  cosmic: Zap,
  ocean: Waves,
} as const;

const themeNames = {
  light: 'Light',
  dark: 'Dark',
  colorful: 'Colorful',
  cosmic: 'Cosmic',
  ocean: 'Ocean',
} as const;

interface ThemeSwitcherProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThemeSwitcher = memo<ThemeSwitcherProps>(({ 
  variant = 'button', 
  size = 'md',
  className = '' 
}) => {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const CurrentIcon = themeIcons[theme];
  
  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size={size}
        icon={CurrentIcon}
        onClick={toggleTheme}
        className={`hover:shadow-glow transition-all duration-300 ${className}`}
        aria-label={`Switch theme (current: ${themeNames[theme]})`}
      />
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size={size}
        icon={CurrentIcon}
        onClick={() => setIsOpen(!isOpen)}
        className="hover:shadow-glow transition-all duration-300"
        aria-label="Theme options"
      >
        {themeNames[theme]}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute right-0 mt-2 w-48 glass-enhanced rounded-2xl shadow-2xl border border-[var(--border)] z-50"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="p-2">
                {Object.entries(themeIcons).map(([themeName, IconComponent]) => {
                  const isActive = theme === themeName;
                  return (
                    <motion.button
                      key={themeName}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-[var(--primary)] text-white shadow-glow' 
                          : 'hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
                        }
                      `}
                      onClick={() => {
                        setTheme(themeName as keyof typeof themeIcons);
                        setIsOpen(false);
                      }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconComponent size={18} />
                      <span className="font-medium">
                        {themeNames[themeName as keyof typeof themeNames]}
                      </span>
                      {isActive && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

ThemeSwitcher.displayName = 'ThemeSwitcher';