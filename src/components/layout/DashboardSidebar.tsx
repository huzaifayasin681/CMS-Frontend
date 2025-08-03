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
        className={`fixed inset-y-0 left-0 w-64 bg-[var(--sidebar)] transform z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0 md:inset-auto`}
      >
        <div className="h-full flex flex-col">
          {/* Logo / Title */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link href="/dashboard" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/posts" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
              Posts
            </Link>
            <Link href="/dashboard/pages" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
              Pages
            </Link>
            <Link href="/dashboard/media" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
              Media
            </Link>
            <Link href="/dashboard/analytics" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
              Analytics
            </Link>
            {permissions.isSuperAdmin && (
              <Link href="/dashboard/users" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
                User Management
              </Link>
            )}
            <Link href="/dashboard/profile" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
              Profile
            </Link>
            <Link href="/dashboard/settings" className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors">
              Settings
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}
