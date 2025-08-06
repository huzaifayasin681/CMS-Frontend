'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  Settings,
  FileText,
  Shield,
  Upload,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import Link from 'next/link';

interface Notification {
  _id: string;
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

interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  urgentCount: number;
  readCount: number;
  typeBreakdown: Array<{ _id: string; count: number }>;
  categoryBreakdown: Array<{ _id: string; count: number }>;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  system: Settings
};

const categoryIcons = {
  user_action: Users,
  system_update: Settings,
  content_change: FileText,
  security: Shield,
  approval: CheckCircle,
  media: Upload,
  comment: MessageSquare,
  general: Bell
};

const typeColors = {
  info: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
  success: 'text-green-500 bg-green-50 dark:bg-green-950/20',
  warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  error: 'text-red-500 bg-red-50 dark:bg-red-950/20',
  system: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20'
};

const priorityColors = {
  low: 'border-l-gray-300',
  medium: 'border-l-blue-400',
  high: 'border-l-yellow-400',
  urgent: 'border-l-red-500'
};

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    priority: '',
    unreadOnly: false,
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setPagination(data.data.pagination);
      } else {
        showToast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        fetchStats();
        showToast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        fetchStats();
        showToast.success(`${data.data.markedCount} notifications marked as read`);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
        fetchStats();
        showToast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast.error('Failed to delete notification');
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(notificationId)) {
        newSelection.delete(notificationId);
      } else {
        newSelection.add(notificationId);
      }
      return newSelection;
    });
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n._id)));
    }
  };

  const handleBulkAction = async (action: 'read' | 'delete') => {
    if (selectedNotifications.size === 0) return;

    if (action === 'read') {
      // Mark selected as read
      for (const notificationId of selectedNotifications) {
        await markAsRead(notificationId);
      }
    } else if (action === 'delete') {
      // Delete selected
      for (const notificationId of selectedNotifications) {
        await deleteNotification(notificationId);
      }
    }

    setSelectedNotifications(new Set());
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

  const changePage = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Notifications</h1>
          {stats && (
            <p className="text-[var(--secondary)]">
              {stats.totalCount} total, {stats.unreadCount} unread
              {stats.urgentCount > 0 && (
                <span className="text-red-500 ml-2">({stats.urgentCount} urgent)</span>
              )}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {stats && stats.unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read ({stats.unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-[var(--foreground)]">{stats.totalCount}</div>
            <div className="text-sm text-[var(--secondary)]">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.unreadCount}</div>
            <div className="text-sm text-[var(--secondary)]">Unread</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats.urgentCount}</div>
            <div className="text-sm text-[var(--secondary)]">Urgent</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.readCount}</div>
            <div className="text-sm text-[var(--secondary)]">Read</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--secondary)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">Filters:</span>
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            className="px-3 py-1 border rounded-md text-sm bg-[var(--background)] border-[var(--border)]"
          >
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="system">System</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="px-3 py-1 border rounded-md text-sm bg-[var(--background)] border-[var(--border)]"
          >
            <option value="">All Categories</option>
            <option value="user_action">User Actions</option>
            <option value="system_update">System Updates</option>
            <option value="content_change">Content Changes</option>
            <option value="security">Security</option>
            <option value="approval">Approvals</option>
            <option value="media">Media</option>
            <option value="comment">Comments</option>
            <option value="general">General</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
            className="px-3 py-1 border rounded-md text-sm bg-[var(--background)] border-[var(--border)]"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.unreadOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked, page: 1 }))}
              className="rounded"
            />
            Unread only
          </label>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground)]">
              {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('read')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Mark as read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="mt-2 text-[var(--secondary)]">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-[var(--secondary)] opacity-50" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No notifications</h3>
            <p className="text-[var(--secondary)]">
              {Object.values(filters).some(f => f) ? 
                'No notifications match your current filters.' : 
                'You have no notifications yet.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-[var(--border)]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === notifications.length}
                  onChange={selectAllNotifications}
                  className="rounded"
                />
                <span className="text-sm text-[var(--foreground)]">
                  Select all on this page
                </span>
              </label>
            </div>

            <div className="divide-y divide-[var(--border)]">
              <AnimatePresence>
                {notifications.map((notification) => {
                  const TypeIcon = typeIcons[notification.type];
                  const CategoryIcon = categoryIcons[notification.category];
                  const typeStyle = typeColors[notification.type];
                  const priorityBorder = priorityColors[notification.priority];
                  const isSelected = selectedNotifications.has(notification._id);

                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`relative p-4 hover:bg-[var(--hover)] transition-colors ${
                        !notification.read ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                      } ${priorityBorder} border-l-4 ${isSelected ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleNotificationSelection(notification._id)}
                          className="mt-1 rounded"
                        />

                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeStyle}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CategoryIcon className="w-4 h-4 text-[var(--secondary)]" />
                            <h3 className="font-semibold text-[var(--foreground)] truncate">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              notification.priority === 'high' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              notification.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {notification.priority}
                            </span>
                          </div>

                          <p className="text-[var(--secondary)] mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-[var(--secondary)]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {notification.sender && (
                                <span>
                                  by {notification.sender.firstName || notification.sender.username}
                                </span>
                              )}
                              {notification.expiresAt && new Date(notification.expiresAt) > new Date() && (
                                <span className="text-yellow-600">
                                  Expires {formatTimeAgo(notification.expiresAt)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {notification.actionUrl && (
                                <Link href={notification.actionUrl}>
                                  <Button variant="outline" size="sm">
                                    {notification.actionText || 'View'}
                                  </Button>
                                </Link>
                              )}
                              
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification._id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--secondary)]">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} notifications
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              
              <span className="text-sm text-[var(--foreground)]">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}