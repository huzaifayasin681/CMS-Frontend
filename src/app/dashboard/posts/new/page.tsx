'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Save,
  Eye,
  ArrowLeft,
  Upload,
  X,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
// import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { showToast } from '@/components/ui/Toast';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { postsAPI } from '@/lib/api';
import Link from 'next/link';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: 'draft' | 'published';
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  publishedAt?: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    status: 'draft',
    tags: [],
    seoTitle: '',
    seoDescription: '',
  });
  const [newTag, setNewTag] = useState('');

  // Auto-generate slug from title
  React.useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      showToast.error('Please enter a title');
      return;
    }

    if (!formData.content.trim()) {
      showToast.error('Please add some content');
      return;
    }

    setIsLoading(true);
    
    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        featuredImage: formData.featuredImage || undefined,
        status,
        tags: formData.tags,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        category: 'general' // Default category
      };

      const response = await postsAPI.createPost(postData);
      
      showToast.success(
        status === 'published' 
          ? 'Post published successfully!'
          : 'Post saved as draft!'
      );
      
      router.push('/dashboard/posts');
    } catch (error: any) {
      console.error('Failed to save post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save post. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = (content: string) => {
    // Auto-save functionality
    console.log('Auto-saving content...');
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
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Create New Post
              </h1>
              <p className="text-[var(--secondary)]">
                Write and publish your content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={Eye}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              variant="secondary"
              icon={Save}
              loading={isLoading}
              onClick={() => handleSave('draft')}
            >
              Save Draft
            </Button>
            
            <Button
              icon={Globe}
              loading={isLoading}
              onClick={() => handleSave('published')}
            >
              Publish
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Title */}
            <Card padding="lg">
              <Input
                name="title"
                placeholder="Enter your post title..."
                value={formData.title}
                onChange={handleInputChange}
                className="text-2xl font-bold border-0 px-0 focus:ring-0 bg-transparent"
              />
            </Card>

            {/* Content Editor */}
            {!showPreview ? (
              <Card padding="lg">
                <textarea
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing your post content..."
                  rows={15}
                  className="w-full px-3 py-2 border-0 focus:ring-0 bg-transparent text-[var(--foreground)] placeholder-[var(--secondary)] resize-vertical font-mono text-sm"
                />
              </Card>
            ) : (
              <Card padding="lg">
                <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none">
                  <h1>{formData.title || 'Untitled Post'}</h1>
                  <div dangerouslySetInnerHTML={{ __html: formData.content || '<p>No content yet...</p>' }} />
                </div>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Post Settings */}
            <Card padding="lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                Post Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    URL Slug
                  </label>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="post-url-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief description of your post..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
              </div>
            </Card>

            {/* Featured Image */}
            <Card padding="lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                Featured Image
              </h3>
              
              {formData.featuredImage ? (
                <div className="space-y-3">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={Upload}
                      onClick={() => {
                        const url = window.prompt('Enter image URL:', formData.featuredImage);
                        if (url !== null) {
                          setFormData(prev => ({ ...prev, featuredImage: url }));
                        }
                      }}
                    >
                      Change
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  fullWidth
                  icon={Upload}
                  onClick={() => {
                    const url = window.prompt('Enter image URL:');
                    if (url) {
                      setFormData(prev => ({ ...prev, featuredImage: url }));
                    }
                  }}
                >
                  Add Featured Image
                </Button>
              )}
            </Card>

            {/* Tags */}
            <Card padding="lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                Tags
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* SEO */}
            <Card padding="lg">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                SEO Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    SEO Title
                  </label>
                  <Input
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    placeholder="SEO optimized title..."
                    hint={`${formData.seoTitle.length}/70 characters`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    placeholder="SEO meta description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                  <p className="text-xs text-[var(--secondary)] mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}