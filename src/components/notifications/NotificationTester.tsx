'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Info, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/auth';
import Cookies from 'js-cookie';

const NotificationTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'info' | 'success' | 'warning' | 'error' | 'system'>('info');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  
  const { token } = useAuthStore();

  const typeIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    system: Settings
  };

  const typeColors = {
    info: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    error: 'from-red-500 to-red-600',
    system: 'from-purple-500 to-purple-600'
  };

  const sendTestNotification = async () => {
    try {
      setLoading(true);
      const authToken = token || Cookies.get('cms_token');
      if (!authToken) {
        showToast.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/test/test-notification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: selectedType,
          priority: selectedPriority,
          sendEmail: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast.success('Test notification sent successfully!');
        console.log('Test notification created:', data);
      } else {
        const errorData = await response.json();
        showToast.error(`Failed to send notification: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      showToast.error('Error sending test notification');
    } finally {
      setLoading(false);
    }
  };

  const sendApprovalTest = async () => {
    try {
      setLoading(true);
      const authToken = token || Cookies.get('cms_token');

      const response = await fetch('/api/test/test-approval', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast.success(`Approval notifications sent to ${data.data.notifiedAdmins} admin(s)`);
      } else {
        const errorData = await response.json();
        showToast.error(`Failed to send approval notifications: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error sending approval test:', error);
      showToast.error('Error sending approval notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendContentTest = async () => {
    try {
      setLoading(true);
      const authToken = token || Cookies.get('cms_token');

      const response = await fetch('/api/test/test-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast.success('Content published notification sent!');
      } else {
        const errorData = await response.json();
        showToast.error(`Failed to send content notification: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error sending content test:', error);
      showToast.error('Error sending content notification');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      setLoading(true);
      const authToken = token || Cookies.get('cms_token');

      const response = await fetch('/api/test/health', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const health = data.data;
        showToast.info(
          `WebSocket: ${health.isConnectedToWebSocket ? 'Connected' : 'Disconnected'} | ` +
          `Connected Users: ${health.totalConnectedUsers} | ` +
          `Unread: ${health.unreadNotifications}`
        );
        console.log('Notification system health:', health);
      } else {
        showToast.error('Failed to check system health');
      }
    } catch (error) {
      console.error('Error checking health:', error);
      showToast.error('Error checking system health');
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = typeIcons[selectedType];

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          🔔 Notification System Tester
        </h2>
        <p className="text-[var(--secondary)]">
          Test the real-time notification system with WebSocket integration and email delivery.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Notification Test */}
        <div className="border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-4">Basic Notification Test</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${typeColors[selectedType]} flex items-center justify-center`}>
              <SelectedIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-[var(--foreground)]">
                Test {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Notification
              </div>
              <div className="text-sm text-[var(--secondary)]">
                Priority: {selectedPriority} | Real-time + WebSocket
              </div>
            </div>
          </div>

          <Button 
            onClick={sendTestNotification} 
            disabled={loading}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>
        </div>

        {/* Scenario Tests */}
        <div className="border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-4">Scenario Tests</h3>
          
          <div className="grid gap-3">
            <Button 
              onClick={sendApprovalTest} 
              disabled={loading}
              variant="outline"
              className="justify-start"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Test User Approval Notification (Admin Only)
            </Button>
            
            <Button 
              onClick={sendContentTest} 
              disabled={loading}
              variant="outline"
              className="justify-start"
            >
              <Info className="w-4 h-4 mr-2" />
              Test Content Published Notification
            </Button>
          </div>
        </div>

        {/* System Health */}
        <div className="border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-4">System Health</h3>
          
          <Button 
            onClick={checkHealth} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Check Notification System Health
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🧪 Testing Instructions
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Check your notification bell in the header for real-time updates</li>
            <li>• High/Urgent priority notifications will show toast messages</li>
            <li>• Visit /dashboard/notifications to see the full notification list</li>
            <li>• Open browser dev tools to see WebSocket events in console</li>
            <li>• Email notifications are sent for urgent/high priority items</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default NotificationTester;