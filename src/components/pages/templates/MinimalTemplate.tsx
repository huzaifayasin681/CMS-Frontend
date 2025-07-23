'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye } from 'lucide-react';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt: string;
  views: number;
  status: 'published' | 'draft';
  template: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface MinimalTemplateProps {
  page: PageData;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ page }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Minimal Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[var(--foreground)] mb-6 leading-tight">
          {page.title}
        </h1>
        
        {page.excerpt && (
          <p className="text-lg text-[var(--secondary)] leading-relaxed mb-8 font-light">
            {page.excerpt}
          </p>
        )}

        {/* Minimal Meta */}
        <div className="flex items-center justify-center gap-1 text-xs text-[var(--secondary)] font-light">
          <span>By</span>
          <span className="font-medium">
            {page.author.firstName && page.author.lastName
              ? `${page.author.firstName} ${page.author.lastName}`
              : page.author.username}
          </span>
          <span>•</span>
          <span>{formatDate(page.updatedAt)}</span>
        </div>
      </motion.header>

      {/* Featured Image - Minimal Style */}
      {page.featuredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <img
            src={page.featuredImage}
            alt={page.title}
            className="w-full rounded-sm object-cover max-h-80 grayscale-[20%]"
          />
        </motion.div>
      )}

      {/* Minimal Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-light prose-p:leading-relaxed prose-p:text-[var(--foreground)] prose-headings:text-[var(--foreground)]"
      >
        <div 
          className="minimal-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </motion.div>

      {/* Minimal Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 pt-8 text-center"
      >
        <div className="w-16 h-px bg-[var(--border)] mx-auto mb-6"></div>
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--secondary)]">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {page.views}
          </div>
          <span>•</span>
          <span>Updated {formatDate(page.updatedAt)}</span>
        </div>
      </motion.div>

      <style jsx>{`
        .minimal-content :global(h1),
        .minimal-content :global(h2),
        .minimal-content :global(h3),
        .minimal-content :global(h4),
        .minimal-content :global(h5),
        .minimal-content :global(h6) {
          font-family: serif;
          font-weight: 300;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .minimal-content :global(p) {
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: var(--foreground);
        }
        
        .minimal-content :global(blockquote) {
          border-left: 2px solid var(--primary);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: var(--secondary);
        }
        
        .minimal-content :global(img) {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 2px;
        }
        
        .minimal-content :global(ul),
        .minimal-content :global(ol) {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        
        .minimal-content :global(li) {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
      `}</style>
    </article>
  );
};