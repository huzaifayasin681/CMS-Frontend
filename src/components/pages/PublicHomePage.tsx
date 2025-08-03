'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User, Clock, Eye, Star, TrendingUp, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/layout/Header';
import { postsAPI } from '@/lib/api';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';

interface FeaturedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    username: string;
    avatar?: string;
  };
  category: string;
  publishedAt: string;
  readTime: number;
  views: number;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    username: string;
    avatar?: string;
  };
  category: string;
  publishedAt: string;
  readTime: number;
  views: number;
}

export const PublicHomePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'dashboard_access_denied') {
      setShowAccessDenied(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    setIsLoading(true);
    try {
      // Fetch recent posts for both featured and recent sections
      const postsResponse = await postsAPI.getPosts({ limit: 9, status: 'published' });
      const allPosts = postsResponse.data.posts || [];

      // Use first 3 posts as featured, remaining as recent
      setFeaturedPosts(allPosts.slice(0, 3));
      setRecentPosts(allPosts.slice(3, 9));
    } catch (error) {
      console.error('Failed to fetch home content:', error);
      setFeaturedPosts([]);
      setRecentPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header with Navigation */}
      <Header />

      {/* Access Denied Alert */}
      {showAccessDenied && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 fixed top-16 left-0 right-0 z-50 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Dashboard Access Restricted
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Viewer accounts don't have access to the dashboard. Contact an administrator for elevated permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAccessDenied(false)}
                className="text-yellow-400 hover:text-yellow-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                Content Hub
              </span>
            </h1>
            <p className="text-xl text-[var(--secondary)] mb-8 leading-relaxed">
              Discover insightful articles, tutorials, and stories from our community of writers and creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog">
                <Button size="lg" icon={ArrowRight} iconPosition="right">
                  Explore Articles
                </Button>
              </Link>
              <Link href="/pages/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16 bg-[var(--background)]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              Featured Articles
            </h2>
            <p className="text-[var(--secondary)] max-w-2xl mx-auto">
              Handpicked content that showcases the best insights and stories from our community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} padding="none" className="overflow-hidden">
                  <div className="aspect-video w-full skeleton"></div>
                  <div className="p-6">
                    <LoadingSkeleton lines={4} />
                  </div>
                </Card>
              ))
            ) : featuredPosts.length > 0 ? (
              featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card hover padding="none" className="overflow-hidden group">
                      {post.featuredImage && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-2 py-1 text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-[var(--secondary)]">
                            <Clock size={14} />
                            {post.readTime} min read
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-[var(--secondary)] mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {post.author.avatar ? (
                              <img
                                src={post.author.avatar}
                                alt={post.author.username}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                <User size={12} className="text-[var(--primary)]" />
                              </div>
                            )}
                            <span className="text-sm text-[var(--secondary)]">
                              {post.author.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-[var(--secondary)]">
                            <Eye size={14} />
                            {post.views}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  No Featured Posts Yet
                </h3>
                <p className="text-[var(--secondary)]">
                  Check back soon for featured content from our writers.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                Recent Articles
              </h2>
              <p className="text-[var(--secondary)]">
                Stay up to date with the latest posts from our community.
              </p>
            </div>
            <Link href="/blog">
              <Button variant="outline" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} padding="lg">
                  <LoadingSkeleton lines={3} />
                </Card>
              ))
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card hover padding="lg" className="group h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="px-2 py-1 text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-[var(--secondary)]">
                          <Calendar size={14} />
                          {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[var(--secondary)] text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                            <User size={10} className="text-[var(--primary)]" />
                          </div>
                          <span className="text-xs text-[var(--secondary)]">
                            {post.author.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--secondary)]">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.readTime}m
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.views}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  No Recent Posts
                </h3>
                <p className="text-[var(--secondary)]">
                  New articles will appear here as they are published.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              Stay Updated
            </h2>
            <p className="text-[var(--secondary)] mb-8">
              Subscribe to our newsletter and never miss the latest articles and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
              />
              <Button className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Content Hub
              </h3>
              <p className="text-[var(--secondary)] mb-4">
                A platform for sharing knowledge, insights, and stories from our community of writers and creators.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-4">
                Quick Links
              </h4>
              <div className="space-y-2">
                <Link href="/blog" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  All Articles
                </Link>
                <Link href="/pages/about" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  About Us
                </Link>
                <Link href="/pages/contact" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-4">
                Categories
              </h4>
              <div className="space-y-2">
                <Link href="/blog?category=technology" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Technology
                </Link>
                <Link href="/blog?category=design" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Design
                </Link>
                <Link href="/blog?category=business" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Business
                </Link>
                <Link href="/blog?category=tutorials" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Tutorials
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] mt-8 pt-8 text-center">
            <p className="text-sm text-[var(--secondary)]">
              © 2024 Content Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};