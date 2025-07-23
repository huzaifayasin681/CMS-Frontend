'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData);
      showToast.success('Login successful! Welcome back.');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
        {/* Back to home link */}
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
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--secondary)]">
              Sign in to access your content dashboard
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="login"
              label="Email or Username"
              value={formData.login}
              onChange={handleInputChange}
              placeholder="Enter your email or username"
              required
              autoComplete="username"
            />
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                />
                <span className="text-sm text-[var(--secondary)]">Remember me</span>
              </label>
              
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[var(--secondary)]">
              Do not have an account?{' '}
              <Link
                href="/register"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
          
          {/* Demo credentials info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 glass rounded-lg"
          >
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
              Demo Credentials:
            </h3>
            <div className="text-xs text-[var(--secondary)] space-y-1">
              <div><strong>Admin:</strong> admin@demo.com / admin123</div>
              <div><strong>Editor:</strong> editor@demo.com / editor123</div>
              <div><strong>Viewer:</strong> viewer@demo.com / viewer123</div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}