'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye } from 'lucide-react';
import { PageTemplateProps } from '@/types/page';

export const FullWidthTemplate: React.FC<PageTemplateProps> = ({ page }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Full Width Header with Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-12"
      >
        {/* Background Section */}
        <div className="relative bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[var(--surface)]/80"></div>
          <div className="relative max-w-7xl mx-auto">
            <motion.header
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6">
                {page.title}
              </h1>
              
              {page.excerpt && (
                <p className="text-xl sm:text-2xl text-[var(--secondary)] leading-relaxed mb-8 max-w-4xl mx-auto">
                  {page.excerpt}
                </p>
              )}

              {/* Page Meta */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--secondary)]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {page.author.firstName && page.author.lastName
                    ? `${page.author.firstName} ${page.author.lastName}`
                    : page.author.username}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Updated {formatDate(page.updatedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {page.views} views
                </div>
              </div>
            </motion.header>
          </div>
        </div>
      </motion.div>

      {/* Featured Image */}
      {page.featuredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8"
        >
          <img
            src={page.featuredImage}
            alt={page.title}
            className="w-full object-cover max-h-[60vh]"
          />
        </motion.div>
      )}

      {/* Page Content - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="prose prose-lg max-w-none"
      >
        <div 
          className="full-width-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </motion.div>

      {/* Last Updated - Centered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 pt-8 border-t border-[var(--border)] text-sm text-[var(--secondary)] text-center"
      >
        <p>
          Last updated on {formatDate(page.updatedAt)} by{' '}
          {page.author.firstName && page.author.lastName
            ? `${page.author.firstName} ${page.author.lastName}`
            : page.author.username}
        </p>
      </motion.div>

      <style jsx>{`
        .full-width-content :global(img) {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
        }
        
        .full-width-content :global(.grid) {
          display: grid;
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .full-width-content :global(.grid-cols-2) {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .full-width-content :global(.grid-cols-3) {
          grid-template-columns: repeat(3, 1fr);
        }
        
        @media (max-width: 768px) {
          .full-width-content :global(.grid-cols-2),
          .full-width-content :global(.grid-cols-3) {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </article>
  );
};