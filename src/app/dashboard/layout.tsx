'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
// import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={true}
        />
        
        <div className="flex h-[calc(100vh-64px)]">
          <DashboardSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}