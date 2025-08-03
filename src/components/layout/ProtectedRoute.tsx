'use client';

import React, { JSX, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'superadmin' | 'admin' | 'editor' | 'viewer';
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

    // Check email verification
    if (!isLoading && isAuthenticated && user && !user.emailVerified) {
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    // Check role permissions
    if (!isLoading && isAuthenticated && user && user.emailVerified) {
      const hasPermission = checkRolePermission(user.role, requiredRole);
      if (!hasPermission) {
        // If user is trying to access dashboard but is viewer, redirect to home
        if (requiredRole === 'editor' && user.role === 'viewer') {
          router.push('/?error=dashboard_access_denied');
        } else {
          router.push('/dashboard'); // Redirect to dashboard if no permission
        }
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  const checkRolePermission = (userRole: string, required: string): boolean => {
    const roleHierarchy = { superadmin: 4, admin: 3, editor: 2, viewer: 1 };
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

  if (!isAuthenticated || !user || !user.emailVerified) {
    return <div></div>;
  }

  return <>{children}</>;
};
