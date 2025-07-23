'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/auth';

const passwordRequirements = [
  { text: 'At least 6 characters', regex: /.{6,}/ },
  { text: 'One uppercase letter', regex: /[A-Z]/ },
  { text: 'One lowercase letter', regex: /[a-z]/ },
  { text: 'One number', regex: /\d/ }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);
  
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
    if (!formData.username || formData.username.length < 3) {
      showToast.error('Username must be at least 3 characters long');
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
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      showToast.success('Registration successful! Welcome to Content Hub.');
      router.push('/dashboard');
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
          href="/"
          className="inline-flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--primary)] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        
        <Card glass padding="xl" className="relative">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4"
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Create Account
            </h1>
            <p className="text-[var(--secondary)]">
              Join Content Hub and start creating amazing content
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
              hint="At least 3 characters, letters, numbers, and underscores only"
            />
            
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
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
                <option value="viewer">Viewer - View content only</option>
                <option value="editor">Editor - Create and edit content</option>
                <option value="admin">Admin - Full system access</option>
              </select>
              <p className="text-xs text-[var(--secondary)]">
                Choose your account type. You can request role changes later.
              </p>
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
                placeholder="Confirm your password"
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
            
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)] mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-[var(--secondary)]">
                I agree to the{' '}
                <Link href="/terms" className="text-[var(--primary)] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
              icon={UserPlus}
              disabled={passwordStrength < 4 || formData.password !== formData.confirmPassword}
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[var(--secondary)]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}