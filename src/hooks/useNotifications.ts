'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/lib/auth';
import { showToast } from '@/components/ui/Toast';
import Cookies from 'js-cookie';

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
  expiresAt?: string;
  sender?: {
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  data?: any;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  acknowledgeNotification: (notificationId: string) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, token } = useAuthStore();
  const { socket, isConnected } = useWebSocket();

  // Handle real-time notification events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('New notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => {
        // Check if notification already exists (avoid duplicates)
        if (prev.some(n => n.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev];
      });
      
      // Update unread count
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Show toast notification for urgent/high priority notifications
      if (['urgent', 'high'].includes(notification.priority)) {
        const toastType = notification.type === 'error' ? 'error' : 
                         notification.type === 'warning' ? 'warning' :
                         notification.type === 'success' ? 'success' : 'info';
        
        showToast[toastType](`${notification.title}: ${notification.message}`);
      }
      
      // Send acknowledgment
      socket.emit('notification:acknowledge', { notificationId: notification.id });
    };

    const handleNotificationUpdate = (update: {
      notificationId: string;
      read?: boolean;
      deleted?: boolean;
    }) => {
      console.log('Notification update received:', update);
      
      if (update.deleted) {
        setNotifications(prev => prev.filter(n => n.id !== update.notificationId));
        // Unread count will be updated by the next API call
      } else if (update.read !== undefined) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === update.notificationId 
              ? { ...n, read: update.read! }
              : n
          )
        );
        
        if (update.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    };

    // Register event listeners
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:update', handleNotificationUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:update', handleNotificationUpdate);
    };
  }, [socket, isConnected]);

  const fetchNotifications = useCallback(async (limit = 10) => {
    if (!isAuthenticated) {
      return; // Don't fetch if not authenticated
    }

    try {
      setLoading(true);
      setError(null);
      
      const authToken = token || Cookies.get('cms_token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/notifications?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const authToken = token || Cookies.get('cms_token');
      if (!authToken) return;

      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated, token]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const authToken = token || Cookies.get('cms_token');
      if (!authToken) return;

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
        
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );

        // Notify WebSocket
        if (socket && isConnected) {
          socket.emit('notification:read', { notificationId });
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [isAuthenticated, token, socket, isConnected]);

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const authToken = token || Cookies.get('cms_token');
      if (!authToken) return;

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUnreadCount(0);
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [isAuthenticated, token]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const authToken = token || Cookies.get('cms_token');
      if (!authToken) return;

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
        
        // Remove from local state
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [isAuthenticated, token]);

  const acknowledgeNotification = useCallback((notificationId: string) => {
    if (socket && isConnected) {
      socket.emit('notification:acknowledge', { notificationId });
    }
  }, [socket, isConnected]);

  // Initial fetch on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acknowledgeNotification
  };
}