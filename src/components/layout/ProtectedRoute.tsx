'use client';

import React, { JSX, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole = 'viewer' 
}: ProtectedRouteProps): JSX.Element => {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    
    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check role permissions
    if (!isLoading && isAuthenticated && user) {
      const hasPermission = checkRolePermission(user.role, requiredRole);
      if (!hasPermission) {
        router.push('/dashboard'); // Redirect to dashboard if no permission
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  const checkRolePermission = (userRole: string, required: string): boolean => {
    const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[required as keyof typeof roleHierarchy] || 0;
    return userLevel >= requiredLevel;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // return null;
  }

  return <>{children}</>;
};
