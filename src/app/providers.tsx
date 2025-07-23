'use client';

import React, { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { initializeTheme } from '@/lib/theme';
import { useAuthStore } from '@/lib/auth';

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    // Initialize theme on app start
    initializeTheme();
    
    // Check authentication status
    checkAuth();
  }, [checkAuth]);
  
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
};