'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye } from 'lucide-react';
import { PageTemplateProps } from '@/types/page';

export const DefaultTemplate: React.FC<PageTemplateProps> = ({ page }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Page Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] mb-4">
          {page.title}
        </h1>
        
        {page.excerpt && (
          <p className="text-xl text-[var(--secondary)] leading-relaxed mb-6">
            {page.excerpt}
          </p>
        )}

        {/* Page Meta */}
        <div className="flex flex-wrap items-center gap-4 py-4 border-y border-[var(--border)] text-sm text-[var(--secondary)]">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {page.author.firstName && page.author.lastName
              ? `${page.author.firstName} ${page.author.lastName}`
              : page.author.username}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Updated {formatDate(page.updatedAt)}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {page.views} views
          </div>
        </div>
      </motion.header>

      {/* Featured Image */}
      {page.featuredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <img
            src={page.featuredImage}
            alt={page.title}
            className="w-full rounded-lg object-cover max-h-96"
          />
        </motion.div>
      )}

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 pt-8 border-t border-[var(--border)] text-sm text-[var(--secondary)]"
      >
        <p>
          Last updated on {formatDate(page.updatedAt)} by{' '}
          {page.author.firstName && page.author.lastName
            ? `${page.author.firstName} ${page.author.lastName}`
            : page.author.username}
        </p>
      </motion.div>
    </article>
  );
};