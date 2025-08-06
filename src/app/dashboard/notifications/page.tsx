'use client';

import React from 'react';
import NotificationList from '@/components/notifications/NotificationList';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        <NotificationList />
      </div>
    </ProtectedRoute>
  );
}