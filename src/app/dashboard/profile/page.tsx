'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Save,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  MapPin,
  Globe,
  Camera,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { useAuthStore } from '@/lib/auth';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    website: user?.website || '',
    location: user?.location || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate bio length
    if (name === 'bio' && value.length > 500) {
      return;
    }
    
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Send all profile fields
      await updateProfile(profileData);
      showToast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.errors?.[0]?.msg || 
                         'Failed to update profile';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast.error('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showToast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (url: string) => {
    setProfileData(prev => ({ ...prev, avatar: url }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Profile Settings</h1>
          <p className="text-[var(--secondary)] mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {!isEditing && (
          <Button
            icon={Edit3}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg" className="text-center">
            <div className="mb-4">
              <AvatarUpload
                currentAvatar={profileData.avatar}
                onAvatarChange={handleAvatarChange}
                size="xl"
                editable={isEditing}
                username={user?.username || 'User'}
              />
            </div>

            <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.username
              }
            </h2>
            
            <p className="text-[var(--secondary)] mb-3">{user?.email}</p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
              <Shield size={14} className="mr-1" />
              {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
            </div>

            <div className="text-sm text-[var(--secondary)] space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Calendar size={14} />
                Joined {new Date(user?.createdAt || '').toLocaleDateString()}
              </div>
              
              {user?.lastLogin && (
                <div className="flex items-center justify-center gap-2">
                  <User size={14} />
                  Last active {new Date(user.lastLogin).toLocaleDateString()}
                </div>
              )}
              
              {profileData.location && (
                <div className="flex items-center justify-center gap-2">
                  <MapPin size={14} />
                  {profileData.location}
                </div>
              )}
              
              {profileData.website && (
                <div className="flex items-center justify-center gap-2">
                  <Globe size={14} />
                  <a 
                    href={profileData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Profile Information */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Profile Information
              </h3>
              
              {isEditing && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        bio: user?.bio || '',
                        avatar: user?.avatar || '',
                        website: user?.website || '',
                        location: user?.location || '',
                        phone: user?.phone || ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    icon={Save}
                    loading={isLoading}
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Username"
                value={user?.username || ''}
                disabled
                icon={User}
                hint="Username cannot be changed"
              />
              
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                icon={Mail}
                hint="Contact admin to change email"
              />
              
              <Input
                label="First Name"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
              
              <Input
                label="Last Name"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                disabled={!isEditing}
                placeholder="Enter your last name"
              />
              
              <Input
                label="Website"
                name="website"
                value={profileData.website}
                onChange={handleProfileChange}
                disabled={!isEditing}
                placeholder="https://yourwebsite.com"
                icon={Globe}
              />
              
              <Input
                label="Location"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
                disabled={!isEditing}
                placeholder="City, Country"
                icon={MapPin}
              />
              
              <Input
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-60"
              />
              <p className={`text-xs mt-1 ${
                profileData.bio.length > 450 
                  ? 'text-[var(--danger)]' 
                  : profileData.bio.length > 350 
                    ? 'text-[var(--warning)]' 
                    : 'text-[var(--secondary)]'
              }`}>
                {profileData.bio.length}/500 characters
                {profileData.bio.length > 450 && (
                  <span className="ml-2 text-[var(--danger)]">
                    ({500 - profileData.bio.length} remaining)
                  </span>
                )}
              </p>
            </div>
          </Card>

          {/* Security Settings */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Security Settings
              </h3>
              
              {!isChangingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Shield}
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              )}
            </div>

            {isChangingPassword ? (
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    name="currentPassword"
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-9 text-[var(--secondary)] hover:text-[var(--foreground)]"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    name="newPassword"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    hint="At least 6 characters with letters and numbers"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-9 text-[var(--secondary)] hover:text-[var(--foreground)]"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-9 text-[var(--secondary)] hover:text-[var(--foreground)]"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    icon={Save}
                    loading={isLoading}
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--foreground)]">Password</h4>
                    <p className="text-sm text-[var(--secondary)]">
                      Last changed {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-[var(--success)]">●●●●●●●●</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--foreground)]">Two-Factor Authentication</h4>
                    <p className="text-sm text-[var(--secondary)]">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Account Stats */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Account Activity
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Posts Created', value: '12', color: 'text-blue-500' },
                { label: 'Pages Created', value: '3', color: 'text-green-500' },
                { label: 'Media Uploaded', value: '45', color: 'text-purple-500' },
                { label: 'Comments', value: '28', color: 'text-orange-500' }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--secondary)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}