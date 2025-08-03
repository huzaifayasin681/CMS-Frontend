'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Globe,
  Mail,
  Shield,
  Palette,
  Database,
  Bell,
  Users,
  Settings as SettingsIcon,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { LogoUpload } from '@/components/ui/LogoUpload';
import { usePermissions, useAuthStore } from '@/lib/auth';
import { useThemeStore } from '@/lib/theme';
import { settingsAPI } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const permissions = usePermissions();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // All settings combined
  const [settings, setSettings] = useState({
    // General Settings
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    adminEmail: '',
    timezone: 'America/New_York',
    language: 'en',
    siteLogo: '',
    
    // Content Settings
    postsPerPage: 10,
    allowComments: true,
    moderateComments: true,
    allowRegistration: false,
    defaultRole: 'viewer' as 'viewer' | 'editor' | 'admin',
    autoSave: true,
    contentVersioning: true,
    
    // Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    fromEmail: '',
    fromName: '',
    
    // Notification Settings
    newComments: true,
    newUsers: true,
    newPosts: false,
    systemUpdates: true,
    emailDigest: false,
    desktopNotifications: true,
    
    // Security Settings
    enableTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    
    // Analytics Settings
    enableAnalytics: true,
    trackingCode: ''
  });

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await settingsAPI.getSettings();
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        showToast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    if (permissions.isAdmin) {
      fetchSettings();
    } else {
      setIsLoading(false);
    }
  }, [permissions.isAdmin]);

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await settingsAPI.updateSettings(settings);
      if (response.data.success) {
        showToast.success('Settings updated successfully');
        setSettings(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showToast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Update settings helper
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateSetting(name, value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    updateSetting(name, type === 'checkbox' ? checked : value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    updateSetting(name, type === 'checkbox' ? checked : value);
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateSetting(name, checked);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const response = await settingsAPI.uploadLogo(file);
      updateSetting('siteLogo', response.data.media.url);
      showToast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Logo upload failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload logo';
      showToast.error(errorMessage);
    }
  };

  const handleTestEmail = async () => {
    const testEmail = window.prompt('Enter email address to test:');
    if (!testEmail) return;

    try {
      await settingsAPI.testEmailConfig(testEmail);
      showToast.success(`Test email sent to ${testEmail}`);
    } catch (error: any) {
      console.error('Email test failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send test email';
      showToast.error(errorMessage);
    }
  };

  const settingsSections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: Globe,
      description: 'Basic site configuration and branding'
    },
    {
      id: 'content',
      title: 'Content Settings', 
      icon: SettingsIcon,
      description: 'Content management and publishing options'
    },
    {
      id: 'theme',
      title: 'Appearance',
      icon: Palette,
      description: 'Theme and visual customization'
    },
    {
      id: 'users',
      title: 'User Management',
      icon: Users,
      description: 'User roles and registration settings'
    },
    {
      id: 'email',
      title: 'Email Configuration',
      icon: Mail,
      description: 'SMTP settings for email notifications'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Notification preferences and alerts'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Security and authentication settings'
    }
  ];

  const [activeSection, setActiveSection] = useState('general');

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Site Name"
          name="siteName"
          value={settings.siteName}
          onChange={handleGeneralChange}
          placeholder="Your site name"
        />
        
        <Input
          label="Site URL"
          name="siteUrl"
          value={settings.siteUrl}
          onChange={handleGeneralChange}
          placeholder="https://yourdomain.com"
        />
        
        <Input
          label="Admin Email"
          name="adminEmail"
          type="email"
          value={settings.adminEmail}
          onChange={handleGeneralChange}
          placeholder="admin@yourdomain.com"
        />
        
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Timezone
          </label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleGeneralChange}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Site Description
        </label>
        <textarea
          name="siteDescription"
          value={settings.siteDescription}
          onChange={(e) => updateSetting('siteDescription', e.target.value)}
          placeholder="Describe your website..."
          rows={3}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-4">
          Site Logo
        </label>
        <LogoUpload
          currentLogo={settings.siteLogo}
          onLogoChange={(url) => updateSetting('siteLogo', url)}
          disabled={isSaving}
        />
      </div>
    </div>
  );

  const renderContentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Posts per page
          </label>
          <input
            type="number"
            name="postsPerPage"
            value={settings.postsPerPage}
            onChange={handleContentChange}
            min="1"
            max="50"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Default User Role
          </label>
          <select
            name="defaultRole"
            value={settings.defaultRole}
            onChange={handleContentChange}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { name: 'allowComments', label: 'Allow comments on posts', description: 'Visitors can leave comments on published posts' },
          { name: 'moderateComments', label: 'Moderate comments', description: 'Comments must be approved before appearing' },
          { name: 'allowRegistration', label: 'Allow user registration', description: 'New users can create accounts' },
          { name: 'autoSave', label: 'Auto-save content', description: 'Automatically save drafts while editing' },
          { name: 'contentVersioning', label: 'Content versioning', description: 'Keep history of content changes' }
        ].map((setting) => (
          <div key={setting.name} className="flex items-start gap-3">
            <input
              type="checkbox"
              name={setting.name}
              checked={settings[setting.name as keyof typeof settings] as boolean}
              onChange={handleContentChange}
              className="mt-1 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
            />
            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">
                {setting.label}
              </label>
              <p className="text-sm text-[var(--secondary)]">
                {setting.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-4">
          Theme Selection
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'light', name: 'Light Theme', preview: 'bg-white border-gray-200' },
            { value: 'dark', name: 'Dark Theme', preview: 'bg-gray-900 border-gray-700' },
            { value: 'colorful', name: 'Colorful Theme', preview: 'bg-gradient-to-br from-purple-400 to-pink-400' }
          ].map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === themeOption.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <div className={`w-full h-16 rounded-lg mb-3 ${themeOption.preview}`} />
              <p className="font-medium text-[var(--foreground)]">{themeOption.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Theme Preview</h4>
        <p className="text-sm text-blue-700">
          Changes to theme settings are applied immediately. You can switch between themes at any time.
        </p>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="SMTP Host"
          name="smtpHost"
          value={settings.smtpHost}
          onChange={handleEmailChange}
          placeholder="smtp.gmail.com"
        />
        
        <Input
          label="SMTP Port"
          name="smtpPort"
          type="number"
          value={settings.smtpPort}
          onChange={handleEmailChange}
          placeholder="587"
        />
        
        <Input
          label="SMTP Username"
          name="smtpUser"
          value={settings.smtpUser}
          onChange={handleEmailChange}
          placeholder="your-email@gmail.com"
        />
        
        <div className="relative">
          <Input
            label="SMTP Password"
            name="smtpPassword"
            type={showSmtpPassword ? 'text' : 'password'}
            value={settings.smtpPassword}
            onChange={handleEmailChange}
            placeholder="Your app password"
          />
          <button
            type="button"
            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
            className="absolute right-3 top-9 text-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            {showSmtpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <Input
          label="From Email"
          name="fromEmail"
          type="email"
          value={settings.fromEmail}
          onChange={handleEmailChange}
          placeholder="noreply@yourdomain.com"
        />
        
        <Input
          label="From Name"
          name="fromName"
          value={settings.fromName}
          onChange={handleEmailChange}
          placeholder="Your Site Name"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="smtpSecure"
          checked={settings.smtpSecure}
          onChange={handleEmailChange}
          className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
        />
        <div>
          <label className="text-sm font-medium text-[var(--foreground)]">
            Use SSL/TLS encryption
          </label>
          <p className="text-sm text-[var(--secondary)]">
            Recommended for secure email delivery
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        <div>
          <h4 className="font-medium text-[var(--foreground)]">Test Email Configuration</h4>
          <p className="text-sm text-[var(--secondary)]">
            Send a test email to verify your SMTP settings are working correctly
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleTestEmail}
          disabled={!settings.smtpHost || isSaving}
        >
          Send Test Email
        </Button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {[
        { name: 'newComments', label: 'New Comments', description: 'Get notified when someone comments on your posts' },
        { name: 'newUsers', label: 'New User Registrations', description: 'Get notified when new users register' },
        { name: 'systemUpdates', label: 'System Updates', description: 'Get notified about system updates and maintenance' },
        { name: 'emailDigest', label: 'Weekly Email Digest', description: 'Receive a weekly summary of site activity' },
        { name: 'desktopNotifications', label: 'Desktop Notifications', description: 'Show desktop notifications in your browser' }
      ].map((notification) => (
        <div key={notification.name} className="flex items-start gap-3">
          <input
            type="checkbox"
            name={notification.name}
            checked={settings[notification.name as keyof typeof settings] as boolean}
            onChange={handleNotificationChange}
            className="mt-1 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
          />
          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              {notification.label}
            </label>
            <p className="text-sm text-[var(--secondary)]">
              {notification.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Session Timeout (hours)
          </label>
          <input
            type="number"
            name="sessionTimeout"
            value={settings.sessionTimeout || 24}
            onChange={handleContentChange}
            min="1"
            max="168"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <p className="text-xs text-[var(--secondary)] mt-1">
            Users will be logged out after this period of inactivity
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            name="maxLoginAttempts"
            value={settings.maxLoginAttempts || 5}
            onChange={handleContentChange}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <p className="text-xs text-[var(--secondary)] mt-1">
            Account will be temporarily locked after this many failed attempts
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="enableTwoFactor"
            checked={settings.enableTwoFactor || false}
            onChange={handleContentChange}
            className="mt-1 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
          />
          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Enable Two-Factor Authentication
            </label>
            <p className="text-sm text-[var(--secondary)]">
              Require users to verify their identity with a second factor (coming soon)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="enableAnalytics"
            checked={settings.enableAnalytics || true}
            onChange={handleContentChange}
            className="mt-1 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
          />
          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              Enable Analytics Tracking
            </label>
            <p className="text-sm text-[var(--secondary)]">
              Collect usage analytics and performance metrics
            </p>
          </div>
        </div>
      </div>

      {settings.enableAnalytics && (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Analytics Tracking Code
          </label>
          <textarea
            name="trackingCode"
            value={settings.trackingCode || ''}
            onChange={(e) => updateSetting('trackingCode', e.target.value)}
            placeholder="<!-- Google Analytics, Meta Pixel, or other tracking code -->"
            rows={4}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] font-mono text-sm"
          />
          <p className="text-xs text-[var(--secondary)] mt-1">
            Add your Google Analytics, Meta Pixel, or other tracking scripts here
          </p>
        </div>
      )}
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'content': return renderContentSettings();
      case 'theme': return renderThemeSettings();
      case 'email': return renderEmailSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      default: return renderGeneralSettings();
    }
  };

  if (!permissions.isAdmin) {
    return (
      <div className="text-center py-16">
        <Shield className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Admin Access Required
        </h2>
        <p className="text-[var(--secondary)]">
          You need administrator privileges to access system settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-[var(--secondary)] mt-1">
            Configure your CMS system and preferences
          </p>
        </div>

        <Button
          icon={Save}
          loading={isSaving}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="none">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-none first:rounded-t-xl last:rounded-b-xl transition-colors ${
                      activeSection === section.id
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--foreground)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <Icon size={18} />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className={`text-xs ${
                        activeSection === section.id ? 'text-blue-100' : 'text-[var(--secondary)]'
                      }`}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card padding="lg">
            <div className="mb-6">
              {(() => {
                const section = settingsSections.find(s => s.id === activeSection);
                const Icon = section?.icon || SettingsIcon;
                return (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                      <Icon className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--foreground)]">
                        {section?.title}
                      </h2>
                      <p className="text-[var(--secondary)]">
                        {section?.description}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {renderSectionContent()}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}