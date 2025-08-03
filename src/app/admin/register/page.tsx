'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, ArrowLeft, Check, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore, usePermissions } from '@/lib/auth';
import { authAPI } from '@/lib/api';

const passwordRequirements = [
  { text: 'At least 6 characters', regex: /.{6,}/ },
  { text: 'One uppercase letter', regex: /[A-Z]/ },
  { text: 'One lowercase letter', regex: /[a-z]/ },
  { text: 'One number', regex: /\d/ }
];

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'editor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { isAuthenticated, user } = useAuthStore();
  const permissions = usePermissions();
  const router = useRouter();
  
  useEffect(() => {
    // Only admins and superadmins can access this page (Editor and Viewer cannot)
    if (isAuthenticated && user && !['admin', 'superadmin'].includes(user.role)) {
      router.replace('/dashboard');
      showToast.error('Access denied. Only SuperAdmin and Admin can create user accounts.');
      return;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
  }, [isAuthenticated, user, router]);
  
  useEffect(() => {
    const strength = passwordRequirements.reduce((score, req) => {
      return score + (req.regex.test(formData.password) ? 1 : 0);
    }, 0);
    setPasswordStrength(strength);
  }, [formData.password]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const validateForm = () => {
    if (!formData.username || formData.username.length < 3 || formData.username.length > 30) {
      showToast.error('Username must be between 3 and 30 characters long');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      showToast.error('Username can only contain letters, numbers, and underscores');
      return false;
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      showToast.error('Please enter a valid email address');
      return false;
    }
    
    if (passwordStrength < 4) {
      showToast.error('Password must meet all requirements');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await authAPI.adminRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      const roleNames = {
        superadmin: 'SuperAdmin',
        admin: 'Admin', 
        editor: 'Editor',
        viewer: 'Viewer'
      };
      showToast.success(`${roleNames[formData.role as keyof typeof roleNames]} account created successfully!`);
      router.push('/dashboard/users');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getStrengthText = () => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  // Show loading or nothing while checking authentication
  if (!isAuthenticated || !user || !['admin', 'superadmin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-[var(--accent)]/5 to-[var(--secondary)]/5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--primary)] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Link>
        
        <Card glass padding="xl" className="relative">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Create Staff Account
            </h1>
            <p className="text-[var(--secondary)]">
              Create editor or admin accounts for your team
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              required
              autoComplete="username"
              hint="3-30 characters, letters, numbers, and underscores only"
            />
            
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              autoComplete="email"
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-colors"
              >
                <option value="editor">Editor - Create and edit content</option>
                <option value="viewer">Viewer - Read-only access</option>
                {user?.role === 'superadmin' && (
                  <>
                    <option value="admin">Admin - System management</option>
                    <option value="superadmin">SuperAdmin - Ultimate system control</option>
                  </>
                )}
              </select>
              <div className="flex items-start gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  {formData.role === 'superadmin' ? (
                    <>
                      <Shield className="w-3 h-3 text-red-500" />
                      <span className="text-red-600 font-medium">SuperAdmin</span>
                    </>
                  ) : formData.role === 'admin' ? (
                    <>
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Admin</span>
                    </>
                  ) : formData.role === 'editor' ? (
                    <>
                      <UserPlus className="w-3 h-3 text-blue-500" />
                      <span className="text-blue-600 font-medium">Editor</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 text-green-500" />
                      <span className="text-green-600 font-medium">Viewer</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[var(--secondary)]">
                  {formData.role === 'superadmin'
                    ? 'Ultimate system control including creating other superadmins'
                    : formData.role === 'admin' 
                    ? 'System management and can create Editor/Viewer accounts only' 
                    : formData.role === 'editor'
                    ? 'Can create, edit, and manage content but no admin privileges'
                    : 'Read-only access to published content, no dashboard access'
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[var(--surface)] rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--secondary)]">
                      {getStrengthText()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-1 ${
                          req.regex.test(formData.password)
                            ? 'text-green-500'
                            : 'text-[var(--secondary)]'
                        }`}
                      >
                        {req.regex.test(formData.password) ? (
                          <Check size={12} />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-current" />
                        )}
                        {req.text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm the password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Security Notice</p>
                  <p className="text-xs">
                    {formData.role === 'superadmin'
                      ? 'SuperAdmin accounts have ultimate system control. Only create SuperAdmin accounts for the most trusted individuals.'
                      : formData.role === 'admin' 
                      ? 'Admin accounts can manage system settings but cannot create other Admin accounts. Only SuperAdmin can create Admin accounts.' 
                      : formData.role === 'editor'
                      ? 'Editor accounts can manage content but cannot access system settings or user management.'
                      : 'Viewer accounts have read-only access and cannot access the dashboard or create content.'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
              icon={formData.role === 'superadmin' ? Shield : formData.role === 'admin' ? Crown : formData.role === 'editor' ? UserPlus : Eye}
              disabled={passwordStrength < 4 || formData.password !== formData.confirmPassword}
            >
              Create {formData.role === 'superadmin' ? 'SuperAdmin' : formData.role === 'admin' ? 'Admin' : formData.role === 'editor' ? 'Editor' : 'Viewer'} Account
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[var(--secondary)]">
              Need to manage existing users?{' '}
              <Link
                href="/dashboard/users"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Go to User Management
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}