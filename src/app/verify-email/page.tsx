'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/auth';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { verifyEmail, resendVerification } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const role = searchParams.get('role');

  useEffect(() => {
    if (token) {
      handleVerifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleVerifyEmail = async (verificationToken: string) => {
    setStatus('verifying');
    try {
      await verifyEmail(verificationToken);
      setStatus('success');
      showToast.success('Email verified successfully! You can now log in.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      const errorMessage = error.response?.data?.message || 'Email verification failed.';
      showToast.error(errorMessage);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      showToast.error('Email address is required to resend verification.');
      return;
    }

    setIsResending(true);
    try {
      await resendVerification(email);
      showToast.success('Verification email sent! Please check your inbox and spam folder.');
      setResendCooldown(120); // 2 minute cooldown to match backend rate limit
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email.';
      const retryAfter = error.response?.data?.retryAfter;
      
      if (error.response?.status === 429) {
        showToast.error(`${errorMessage} Please try again in ${retryAfter || 120} seconds.`);
        setResendCooldown(retryAfter || 120);
      } else if (error.response?.status === 400 && errorMessage.includes('already verified')) {
        showToast.success('Your email is already verified! You can now log in.');
        router.push('/login');
      } else {
        showToast.error(errorMessage);
      }
    } finally {
      setIsResending(false);
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return {
          icon: RefreshCw,
          title: 'Verifying Your Email',
          description: 'Please wait while we verify your email address...',
          color: 'text-blue-500',
          bgColor: 'from-blue-500 to-indigo-500',
        };
      case 'success':
        return {
          icon: CheckCircle,
          title: 'Email Verified!',
          description: 'Your email has been successfully verified. Redirecting to login...',
          color: 'text-green-500',
          bgColor: 'from-green-500 to-emerald-500',
        };
      case 'error':
        return {
          icon: AlertCircle,
          title: 'Verification Failed',
          description: 'The verification link is invalid or has expired. Please request a new one.',
          color: 'text-red-500',
          bgColor: 'from-red-500 to-rose-500',
        };
      default:
        return {
          icon: Mail,
          title: role === 'admin' ? 'Admin Account Registration' : 'Check Your Email',
          description: role === 'admin' 
            ? 'Your admin account registration is complete! Please verify your email and wait for admin approval before you can log in.'
            : 'We sent a verification link to your email address. Click the link to verify your account.',
          color: 'text-blue-500',
          bgColor: 'from-blue-500 to-indigo-500',
        };
    }
  };

  const statusContent = getStatusContent();
  const StatusIcon = statusContent.icon;

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
        
        <Card glass padding="xl" className="relative text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${statusContent.bgColor} flex items-center justify-center mx-auto mb-6`}
          >
            <StatusIcon 
              className={`w-10 h-10 text-white ${status === 'verifying' ? 'animate-spin' : ''}`} 
            />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            {statusContent.title}
          </h1>
          
          <p className="text-[var(--secondary)] mb-8 leading-relaxed">
            {statusContent.description}
          </p>

          {email && (
            <div className="bg-[var(--surface)] rounded-lg p-4 mb-6">
              <p className="text-sm text-[var(--secondary)] mb-1">Email address:</p>
              <p className="font-medium text-[var(--foreground)]">{email}</p>
            </div>
          )}

          {/* Action buttons based on status */}
          <div className="space-y-4">
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => router.push('/login')}
                  size="lg"
                  fullWidth
                  icon={CheckCircle}
                >
                  Continue to Login
                </Button>
              </motion.div>
            )}

            {(status === 'pending' || status === 'error') && email && (
              <Button
                onClick={handleResendVerification}
                size="lg"
                fullWidth
                loading={isResending}
                disabled={resendCooldown > 0}
                icon={Mail}
                variant="outline"
              >
                {resendCooldown > 0 
                  ? `Resend in ${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')}` 
                  : 'Resend Verification Email'
                }
              </Button>
            )}

            {status === 'error' && (
              <Button
                onClick={() => router.push('/register')}
                size="lg"
                fullWidth
                variant="outline"
              >
                Back to Registration
              </Button>
            )}
          </div>

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--secondary)] mb-4">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <Link
                href="/login"
                className="text-[var(--primary)] hover:underline"
              >
                Back to Login
              </Link>
              <Link
                href="/register"
                className="text-[var(--primary)] hover:underline"
              >
                Create New Account
              </Link>
            </div>
          </div>

          {/* Email verification tips */}
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
              <li>• Verification links expire in 24 hours</li>
              <li>• Make sure to click the link from the same device</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}