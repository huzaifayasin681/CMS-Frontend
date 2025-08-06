'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Upload, X, Plus, FileText, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { MarkdownRichEditor } from '@/components/ui/MarkdownRichEditor';
import { ContentTemplates } from '@/components/ui/ContentTemplates';
import { ContentPreview } from '@/components/ui/ContentPreview';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { postsAPI } from '@/lib/api';
import { useAutoSave } from '@/hooks/useAutoSave';
import { getContentStats } from '@/utils/readingTime';

interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  seoTitle: string;
  seoDescription: string;
}

interface PostFormProps {
  postId?: string;
  onSave?: (post: any) => void;
  onCancel?: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({ postId, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    category: '',
    tags: [],
    status: 'draft',
    seoTitle: '',
    seoDescription: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [contentStats, setContentStats] = useState(getContentStats(''));

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !postId) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, postId]);

  // Update content stats when content changes
  useEffect(() => {
    setContentStats(getContentStats(formData.content));
  }, [formData.content]);

  // Auto-save functionality
  const { isAutoSaving, lastSaved, saveNow } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      // Only auto-save if we have meaningful content
      if (!data.title.trim() && !data.content.trim()) return;
      
      try {
        if (postId) {
          await postsAPI.updatePost(postId, { ...data, status: 'draft' });
        } else {
          // For new posts, only auto-save if we have at least a title
          if (!data.title.trim()) return;
          
          const response = await postsAPI.createPost({ ...data, status: 'draft' });
          // Update the postId if this is a new post
          if (response.data?.post?.id || response.data?.post?._id) {
            const newPostId = response.data.post.id || response.data.post._id;
            window.history.replaceState(null, '', `/dashboard/posts/${newPostId}/edit`);
          }
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        throw error;
      }
    },
    delay: 3000,
    enabled: true
  });

  const fetchPost = async () => {
    if (!postId) return;
    
    setIsLoading(true);
    try {
      const response = await postsAPI.getPost(postId);
      const post = response.data;
      
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featuredImage: post.featuredImage || '',
        category: post.category || '',
        tags: post.tags || [],
        status: post.status || 'draft',
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || ''
      });
      
      // If this is a draft post with content history, try to restore latest content
      if (post.status === 'draft' && post.contentHistory && post.contentHistory.length > 0) {
        const latestDraft = post.contentHistory[post.contentHistory.length - 1];
        if (latestDraft && latestDraft.content && latestDraft.content.trim()) {
          setFormData(prev => ({
            ...prev,
            content: latestDraft.content
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      showToast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
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
      showToast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      showToast.error('Content is required');
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        ...formData,
        status,
        tags: formData.tags.filter(tag => tag.trim())
      };

      let response;
      if (postId) {
        response = await postsAPI.updatePost(postId, postData);
        showToast.success(`Post ${status === 'published' ? 'published' : 'saved as draft'} successfully`);
      } else {
        response = await postsAPI.createPost(postData);
        showToast.success(`Post ${status === 'published' ? 'published' : 'created as draft'} successfully`);
      }

      if (onSave) {
        onSave(response.data);
      }
    } catch (error: any) {
      console.error('Failed to save post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save post';
      showToast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ['Technology', 'Design', 'Business', 'Lifestyle', 'Tutorials', 'News'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {postId ? 'Edit Post' : 'Create New Post'}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-[var(--secondary)]">
            {isAutoSaving && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
                Auto-saving...
              </div>
            )}
            {lastSaved && !isAutoSaving && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            <div className="flex items-center gap-2">
              <BarChart3 size={14} />
              {contentStats.words} words • {contentStats.readingTime.text}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(true)}
            icon={FileText}
            size="sm"
          >
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            icon={Eye}
            size="sm"
          >
            Preview
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="space-y-4">
              {/* Title */}
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title..."
                required
              />

              {/* Slug */}
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="post-url-slug"
                hint="URL-friendly version of the title"
              />

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of the post..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Content
                </label>
                <MarkdownRichEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Start writing your post content..."
                  showCharacterCount={true}
                  maxCharacters={10000}
                  className="min-h-[400px]"
                  mode="markdown"
                  onImageSelect={(url) => {
                    // Handle image insertion in markdown format
                    console.log('Image inserted:', url);
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Publish
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--secondary)]">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  formData.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleSave('draft')}
                  loading={isSaving}
                  variant="outline"
                  icon={Save}
                  fullWidth
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSave('published')}
                  loading={isSaving}
                  icon={Save}
                  fullWidth
                >
                  {formData.status === 'published' ? 'Update' : 'Publish'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Categories & Tags */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Categories & Tags
            </h3>
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent text-sm"
                  />
                  <Button size="sm" onClick={handleAddTag} icon={Plus}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary)] text-white text-xs rounded"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Featured Image */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Featured Image
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  label="Image URL"
                  value={formData.featuredImage}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    icon={Upload}
                    size="sm"
                    onClick={() => setShowImageUpload(true)}
                  >
                    Browse
                  </Button>
                </div>
              </div>
              {formData.featuredImage && (
                <div className="relative">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    onClick={() => handleInputChange('featuredImage', '')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Content Stats */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Content Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--secondary)]">Words:</span>
                <span className="font-medium">{contentStats.words}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--secondary)]">Characters:</span>
                <span className="font-medium">{contentStats.characters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--secondary)]">Paragraphs:</span>
                <span className="font-medium">{contentStats.paragraphs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--secondary)]">Reading Time:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock size={14} />
                  {contentStats.readingTime.text}
                </span>
              </div>
            </div>
          </Card>

          {/* SEO */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              SEO Settings
            </h3>
            <div className="space-y-4">
              <Input
                label="SEO Title"
                value={formData.seoTitle}
                onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                placeholder="Optimized title for search engines"
                hint={`${formData.seoTitle.length}/60 characters`}
              />
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical"
                />
                <p className="text-xs text-[var(--secondary)] mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Content Templates Modal */}
      <ContentTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(content) => handleInputChange('content', content)}
      />

      {/* Content Preview Modal */}
      <ContentPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={formData.title}
        content={formData.content}
        featuredImage={formData.featuredImage}
        category={formData.category}
        tags={formData.tags}
      />

      {/* Image Upload Modal */}
      <ImageUpload
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelect={(url) => {
          handleInputChange('featuredImage', url);
          setShowImageUpload(false);
        }}
      />
    </div>
  );
};