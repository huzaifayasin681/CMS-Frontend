'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Menu, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { showToast } from '@/components/ui/Toast';
import { PublicNav } from '@/components/layout/PublicNav';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  showMenuButton = false 
}) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    showToast.success('Logged out successfully');
  };
  
  
  return (
    <header className="glass-strong border-b border-[var(--glass-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="sm"
                icon={Menu}
                onClick={onMenuToggle}
                className="md:hidden"
              />
            )}
            
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">CMS</span>
              </motion.div>
              <span className="font-semibold text-lg text-[var(--foreground)]">
                Content Hub
              </span>
            </Link>
          </div>
          
          {/* Center - Navigation or Search */}
          <div className="hidden md:flex flex-1 justify-center mx-4 lg:mx-8 min-w-0">
            {showMenuButton ? (
              // Show search in dashboard
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary)] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                />
              </div>
            ) : (
              // Show public navigation on public pages
              <div className="flex-1 overflow-hidden">
                <PublicNav className="flex justify-center" />
              </div>
            )}
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            {/* Theme toggle */}
            <ThemeSwitcher 
              variant="dropdown" 
              size="sm" 
              className="text-[var(--secondary)] hover:text-[var(--primary)]"
            />
            
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Bell}
                  className="text-[var(--secondary)] hover:text-[var(--primary)] relative"
                >
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--danger)] rounded-full"></div>
                </Button>
                
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--surface)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-white" />
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-[var(--foreground)]">
                      {user?.username}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-lg shadow-lg border border-[var(--glass-border)] py-1"
                    >
                      <div className="px-3 py-2 border-b border-[var(--glass-border)]">
                        <p className="text-sm font-medium text-[var(--foreground)]">{user?.username}</p>
                        <p className="text-xs text-[var(--secondary)]">{user?.email}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--primary)] text-white mt-1">
                          {user?.role}
                        </span>
                      </div>
                      
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--surface)] transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile search (only in dashboard) */}
      {showMenuButton && (
        <div className="md:hidden border-t border-[var(--glass-border)] p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>
        </div>
      )}
    </header>
  );
};