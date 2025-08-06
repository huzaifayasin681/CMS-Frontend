'use client';

import React, { JSX } from 'react';
import Link from 'next/link';
import { useAuthStore, usePermissions } from '@/lib/auth';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps): JSX.Element {
  const { user } = useAuthStore();
  const permissions = usePermissions();
  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 sm:w-72 md:w-64 bg-[var(--sidebar)] border-r border-[var(--border)] transform z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0 md:inset-auto`}
        data-tutorial="sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Logo / Title */}
          <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-semibold text-[var(--foreground)]">Dashboard</h1>
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-[var(--surface)] rounded-lg text-[var(--secondary)]"
              >
                ×
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            <Link 
              href="/dashboard" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)] font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/posts" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Posts
            </Link>
            <Link 
              href="/dashboard/pages" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Pages
            </Link>
            <Link 
              href="/dashboard/media" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Media
            </Link>
            <Link 
              href="/dashboard/analytics" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Analytics
            </Link>
            <Link 
              href="/dashboard/notifications" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Notifications
            </Link>
            <Link 
              href="/dashboard/test-notifications" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Test Notifications
            </Link>
            {permissions.isSuperAdmin && (
              <Link 
                href="/dashboard/users" 
                className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
              >
                User Management
              </Link>
            )}
            <Link 
              href="/dashboard/profile" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Profile
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
            >
              Settings
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}
