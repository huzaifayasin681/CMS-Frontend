'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Heart,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/auth';
import { postsAPI } from '@/lib/api';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  category: string;
  featuredImage?: string;
  tags: string[];
  views: number;
  likes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const permissions = usePermissions();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postsAPI.getPosts();
      const postsData = response.data.posts || [];
      
      // Transform API data to match our interface
      const transformedPosts = postsData.map((post: any) => ({
        ...post,
        id: post._id, // Map MongoDB _id to id field
        author: {
          id: post.author._id || post.author.id,
          username: post.author.username,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          avatar: post.author.avatar
        },
        views: post.views || 0,
        likes: post.likes || 0
      }));
      
      setPosts(transformedPosts);
      setFilteredPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      showToast.error('Failed to load posts');
      
      // Fallback to empty array on error
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, statusFilter]);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      console.log('Attempting to delete post with ID:', postId);
      console.log('User permissions:', permissions);
      const response = await postsAPI.deletePost(postId);
      console.log('Delete response:', response);
      setPosts(posts.filter(post => post.id !== postId));
      showToast.success('Post deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      let errorMessage = 'Failed to delete post';
      
      if (error.response?.status === 401) {
        errorMessage = 'You are not authorized to delete posts. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this post.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Post not found.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showToast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Posts</h1>
          <p className="text-[var(--secondary)] mt-1 text-sm sm:text-base">
            Manage your blog posts and articles
          </p>
        </div>

        {permissions.canCreate && (
          <div className="flex-shrink-0">
            <Link href="/dashboard/posts/new">
              <Button icon={Plus} className="w-full sm:w-auto">
                <span className="sm:inline">New Post</span>
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card padding="lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col xs:flex-row gap-2 sm:flex-shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex-1 xs:flex-initial px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <Button
                  variant="outline"
                  icon={Filter}
                  onClick={() => setShowFilters(!showFilters)}
                  size="sm"
                  className="flex-1 xs:flex-initial justify-center"
                >
                  <span className="sm:inline">Filters</span>
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-[var(--border)]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Author
                  </label>
                  <select className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)]">
                    <option>All Authors</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Date Range
                  </label>
                  <select className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)]">
                    <option>All Time</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Tags
                  </label>
                  <select className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)]">
                    <option>All Tags</option>
                    <option>tutorial</option>
                    <option>cms</option>
                    <option>web-development</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Posts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} padding="lg">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg skeleton" />
                <div className="flex-1">
                  <LoadingSkeleton lines={4} />
                </div>
              </div>
            </Card>
          ))
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover padding="lg">
                <div className="flex gap-4">
                  {post.featuredImage && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-1 line-clamp-1">
                            {post.title}
                          </h3>
                          <p className="text-[var(--secondary)] text-sm line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                          {getStatusBadge(post.status)}
                          
                          {permissions.canEdit && (
                            <div className="flex items-center gap-1">
                              <Link href={`/dashboard/posts/${post.id}/edit`}>
                                <Button variant="ghost" size="sm" icon={Edit} className="p-2" title="Edit post" />
                              </Link>
                              {permissions.canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Trash2}
                                  className="p-2"
                                  onClick={() => handleDeletePost(post.id)}
                                  title="Delete post"
                                />
                              )}
                              <Button variant="ghost" size="sm" icon={MoreVertical} className="p-2" title="More options" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-[var(--secondary)]">
                      <div className="flex items-center gap-1 min-w-0">
                        <User size={12} className="flex-shrink-0" />
                        <span className="truncate">
                          {post.author.firstName && post.author.lastName
                            ? `${post.author.firstName} ${post.author.lastName}`
                            : post.author.username}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Calendar size={12} />
                        <span className="hidden xs:inline">
                          {post.status === 'published' && post.publishedAt
                            ? formatDate(post.publishedAt)
                            : formatDate(post.updatedAt)
                          }
                        </span>
                        <span className="xs:hidden">
                          {post.status === 'published' && post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }
                        </span>
                      </div>
                      
                      {post.status === 'published' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.views.toLocaleString()}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Heart size={12} />
                            {post.likes}
                          </div>
                        </>
                      )}
                      
                      {post.status === 'draft' && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Draft</span>
                        </div>
                      )}
                    </div>
                    
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Tag size={14} className="text-[var(--secondary)]" />
                        <div className="flex gap-1 flex-wrap">
                          {post.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-[var(--surface)] text-[var(--secondary)] rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs bg-[var(--surface)] text-[var(--secondary)] rounded">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card padding="xl">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                No posts found
              </h3>
              <p className="text-[var(--secondary)] mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating your first post.'
                }
              </p>
              {permissions.canCreate && !searchTerm && statusFilter === 'all' && (
                <Link href="/dashboard/posts/new">
                  <Button icon={Plus}>
                    Create Your First Post
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </motion.div>

      {/* Pagination */}
      {filteredPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center"
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-[var(--secondary)]">
              Page 1 of 1
            </span>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}