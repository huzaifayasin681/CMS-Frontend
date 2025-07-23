'use client';

import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

interface CustomToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  toastId: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ type, message, toastId }) => {
  const Icon = iconMap[type];
  const colorClass = colorMap[type];
  
  return (
    <div className="glass-strong rounded-lg p-4 shadow-lg max-w-md w-full">
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorClass}`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--foreground)]">{message}</p>
        </div>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="flex-shrink-0 ml-auto text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export const showToast = {
  success: (message: string) => {
    toast.custom((t) => <CustomToast type="success" message={message} toastId={t.id} />, {
      duration: 4000,
    });
  },
  
  error: (message: string) => {
    toast.custom((t) => <CustomToast type="error" message={message} toastId={t.id} />, {
      duration: 6000,
    });
  },
  
  warning: (message: string) => {
    toast.custom((t) => <CustomToast type="warning" message={message} toastId={t.id} />, {
      duration: 5000,
    });
  },
  
  info: (message: string) => {
    toast.custom((t) => <CustomToast type="info" message={message} toastId={t.id} />, {
      duration: 4000,
    });
  },
};

export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{
        top: 80, // Account for header height
      }}
      toastOptions={{
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
};