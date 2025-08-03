'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserCheck, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';

interface PendingUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function PendingApprovalNotification() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingUsers();
    }
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      const response = await authAPI.getPendingUsers();
      setPendingUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!user || user.role !== 'admin' || loading || pendingUsers.length === 0 || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 mb-6">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Pending Admin Approvals
                  </h3>
                  <button
                    onClick={handleDismiss}
                    className="text-yellow-400 hover:text-yellow-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-yellow-700">
                    {pendingUsers.length === 1 
                      ? '1 user is waiting for admin approval'
                      : `${pendingUsers.length} users are waiting for admin approval`
                    }
                  </p>
                  
                  {pendingUsers.length <= 3 && (
                    <div className="mt-3 space-y-1">
                      {pendingUsers.map((user) => (
                        <div key={user._id} className="flex items-center text-sm text-yellow-700">
                          <Users className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="font-medium">{user.username}</span>
                          <span className="mx-1">·</span>
                          <span>{user.email}</span>
                          <span className="mx-1">·</span>
                          <span className="capitalize">{user.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Link href="/dashboard/users?tab=pending">
                    <Button 
                      size="sm" 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Review Applications
                    </Button>
                  </Link>
                  
                  {pendingUsers.length > 3 && (
                    <Link href="/dashboard/users">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 w-full sm:w-auto"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View All Users
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}