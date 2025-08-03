'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { forgotPassword, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      showToast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      setResendCooldown(60); // 1 minute cooldown
      showToast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setResendCooldown(60);
      showToast.success('Password reset email sent again');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend reset email';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
          
          <Card glass padding="xl" className="relative text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              Check Your Email
            </h1>
            
            <p className="text-[var(--secondary)] mb-6 leading-relaxed">
              We've sent password reset instructions to:
            </p>

            <div className="bg-[var(--surface)] rounded-lg p-4 mb-6">
              <p className="font-medium text-[var(--foreground)]">{email}</p>
            </div>

            <p className="text-sm text-[var(--secondary)] mb-8">
              If you don't see the email, check your spam folder. The reset link will expire in 1 hour.
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleResend}
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={resendCooldown > 0}
                icon={Mail}
                variant="outline"
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend Reset Email'
                }
              </Button>

              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <Link
                  href="/login"
                  className="text-[var(--primary)] hover:underline"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="text-[var(--primary)] hover:underline"
                >
                  Try Different Email
                </button>
              </div>
            </div>

            {/* Email tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 glass rounded-lg text-left"
            >
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
                📧 Email Tips:
              </h3>
              <ul className="text-xs text-[var(--secondary)] space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Reset links expire in 1 hour</li>
                <li>• Make sure to click the link from the same device</li>
                <li>• Contact support if you don't receive the email</li>
              </ul>
            </motion.div>
          </Card>
        </motion.div>
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
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Forgot Password?
            </h1>
            <p className="text-[var(--secondary)]">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              autoComplete="email"
              autoFocus
            />
            
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
              icon={Mail}
            >
              Send Reset Instructions
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[var(--secondary)] mb-4">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
            
            <p className="text-sm text-[var(--secondary)]">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-[var(--primary)] hover:underline"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Security notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 glass rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
                  Security Notice
                </h3>
                <p className="text-xs text-[var(--secondary)]">
                  For security reasons, we'll send reset instructions to your email address 
                  regardless of whether an account exists with that email.
                </p>
              </div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}