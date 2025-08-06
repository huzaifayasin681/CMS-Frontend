'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'user_action' | 'system_update' | 'content_change' | 'security' | 'approval' | 'media' | 'comment' | 'general';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  sender?: {
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface NotificationBellProps {
  onNotificationClick?: (notification: Notification) => void;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  system: AlertCircle
};

const typeColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  system: 'text-purple-500'
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-yellow-400',
  urgent: 'border-l-red-500'
};

export default function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acknowledgeNotification
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Acknowledge the notification
    acknowledgeNotification(notification.id);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    if (notification.actionUrl) {
      setIsOpen(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[var(--hover)] transition-colors"
      >
        <Bell className="w-5 h-5 text-[var(--foreground)]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden z-50"
          >
            <Card className="shadow-lg border-[var(--border)]">
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[var(--foreground)]">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 text-sm text-[var(--secondary)]">
                        ({unreadCount} unread)
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Link href="/dashboard/notifications">
                      <Button variant="ghost" size="sm" className="text-xs">
                        View all
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)] mx-auto"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-[var(--secondary)]">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {notifications.slice(0, 10).map((notification) => {
                      const Icon = typeIcons[notification.type];
                      const iconColor = typeColors[notification.type];
                      const priorityColor = priorityColors[notification.priority];

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`relative p-4 hover:bg-[var(--hover)] transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                          } border-l-4 ${priorityColor}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 ${iconColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm text-[var(--foreground)] truncate">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              
                              <p className="text-sm text-[var(--secondary)] line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--secondary)]">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                
                                {notification.actionUrl && (
                                  <Link href={notification.actionUrl}>
                                    <Button variant="ghost" size="sm" className="text-xs">
                                      {notification.actionText || 'View'}
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}