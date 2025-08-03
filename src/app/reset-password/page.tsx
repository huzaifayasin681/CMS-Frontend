'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowLeft, Check, AlertCircle } from 'lucide-react';
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

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token) {
      showToast.error('Invalid reset link. Please request a new password reset.');
      router.push('/forgot-password');
    }
  }, [token, router]);
  
  useEffect(() => {
    const strength = passwordRequirements.reduce((score, req) => {
      return score + (req.regex.test(formData.newPassword) ? 1 : 0);
    }, 0);
    setPasswordStrength(strength);
  }, [formData.newPassword]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const validateForm = () => {
    if (passwordStrength < 4) {
      showToast.error('Password must meet all requirements');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      showToast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showToast.error('Invalid reset token');
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, formData.newPassword);
      setIsSuccess(true);
      showToast.success('Password reset successfully! You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        showToast.error('Reset link has expired. Please request a new password reset.');
        router.push('/forgot-password');
      } else {
        showToast.error(errorMessage);
      }
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

  if (isSuccess) {
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
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              Password Reset Successful!
            </h1>
            
            <p className="text-[var(--secondary)] mb-8 leading-relaxed">
              Your password has been successfully updated. You can now log in with your new password.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => router.push('/login')}
                size="lg"
                fullWidth
                icon={Lock}
              >
                Continue to Login
              </Button>
            </div>

            <p className="text-sm text-[var(--secondary)] mt-6">
              Redirecting to login page in a few seconds...
            </p>
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
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4"
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Reset Your Password
            </h1>
            <p className="text-[var(--secondary)]">
              Enter your new password below
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  label="New Password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
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
              
              {formData.newPassword && (
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
                          req.regex.test(formData.newPassword)
                            ? 'text-green-500'
                            : 'text-[var(--secondary)]'
                        }`}
                      >
                        {req.regex.test(formData.newPassword) ? (
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
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
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
            
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                Passwords do not match
              </div>
            )}
            
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
              icon={Lock}
              disabled={passwordStrength < 4 || formData.newPassword !== formData.confirmPassword}
            >
              Reset Password
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[var(--secondary)]">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Sign in here
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
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
                  Security Tips
                </h3>
                <ul className="text-xs text-[var(--secondary)] space-y-1">
                  <li>• Use a unique password for this account</li>
                  <li>• Consider using a password manager</li>
                  <li>• Never share your password with anyone</li>
                  <li>• Log out from public computers</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}