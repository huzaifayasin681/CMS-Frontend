'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { PageForm } from '@/components/forms/PageForm';
import Link from 'next/link';

export default function NewPagePage() {
  const router = useRouter();

  const handleSave = (savedPage: any) => {
    // Page created successfully, redirect to pages list
    router.push('/dashboard/pages');
  };

  const handleCancel = () => {
    router.push('/dashboard/pages');
  };

  return (
    <ProtectedRoute requiredRole="editor">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard/pages">
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                Back to Pages
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Create New Page
              </h1>
              <p className="text-[var(--secondary)]">
                Create a new page for your website
              </p>
            </div>
          </div>
        </motion.div>

        {/* Page Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PageForm
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}