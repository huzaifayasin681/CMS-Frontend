'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Eye, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { showToast } from './Toast';

interface ContentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishDate?: Date;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  isOpen,
  onClose,
  title,
  content,
  featuredImage,
  category,
  tags = [],
  author = 'Admin',
  publishDate = new Date()
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--background)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Content Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              onClick={() => {
                // In a real app, this would open the post in a new tab
                showToast.info('Preview would open in new tab');
              }}
            >
              Open in New Tab
            </Button>
            <Button variant="outline" size="sm" icon={X} onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <article className="max-w-3xl mx-auto p-8">
            {/* Article Header */}
            <header className="mb-8">
              {category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                    {category}
                  </span>
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4 leading-tight">
                {title || 'Untitled Post'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--secondary)] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {author.charAt(0).toUpperCase()}
                  </div>
                  <span>By {author}</span>
                </div>
                <span>•</span>
                <time>{publishDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</time>
              </div>

              {featuredImage && (
                <div className="mb-8">
                  <img
                    src={featuredImage}
                    alt={title}
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </header>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none text-[var(--foreground)]
                         prose-headings:text-[var(--foreground)]
                         prose-p:text-[var(--foreground)]
                         prose-strong:text-[var(--foreground)]
                         prose-em:text-[var(--foreground)]
                         prose-blockquote:text-[var(--foreground)] prose-blockquote:border-[var(--primary)]
                         prose-code:text-[var(--primary)] prose-code:bg-[var(--surface)]
                         prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border)]
                         prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline
                         prose-ul:text-[var(--foreground)] prose-ol:text-[var(--foreground)]
                         prose-li:text-[var(--foreground)]
                         prose-table:text-[var(--foreground)]
                         prose-th:border-[var(--border)] prose-td:border-[var(--border)]
                         prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ 
                __html: content || '<p class="text-[var(--secondary)] italic">No content to preview</p>' 
              }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <footer className="mt-12 pt-8 border-t border-[var(--border)]">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-[var(--foreground)] mr-2">Tags:</span>
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 text-sm bg-[var(--surface)] text-[var(--foreground)] rounded-full border border-[var(--border)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </footer>
            )}
          </article>

          {/* Preview Footer */}
          <div className="bg-[var(--surface)] border-t border-[var(--border)] p-4 text-center">
            <p className="text-sm text-[var(--secondary)]">
              This is a preview of how your content will appear to readers
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};