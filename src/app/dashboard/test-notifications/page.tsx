'use client';

import React from 'react';
import NotificationTester from '@/components/notifications/NotificationTester';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function TestNotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        <NotificationTester />
      </div>
    </ProtectedRoute>
  );
}