'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PostForm } from '@/components/forms/PostForm';
import Link from 'next/link';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const handleSave = (updatedPost: any) => {
    // Post updated successfully, redirect to posts list
    router.push('/dashboard/posts');
  };

  const handleCancel = () => {
    router.push('/dashboard/posts');
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
            <Link href="/dashboard/posts">
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                Back to Posts
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Edit Post
              </h1>
              <p className="text-[var(--secondary)]">
                Update your blog post content
              </p>
            </div>
          </div>
        </motion.div>

        {/* Post Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PostForm
            postId={postId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}