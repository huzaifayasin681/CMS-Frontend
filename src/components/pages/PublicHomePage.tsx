'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  User, 
  Eye,
  TrendingUp,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { postsAPI, pagesAPI } from '@/lib/api';

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
  category: string;
  publishedAt: string;
  readTime: number;
}

export const PublicHomePage: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    setIsLoading(true);
    try {
      // Fetch recent posts for both featured and recent sections
      const [postsResponse] = await Promise.all([
        postsAPI.getPosts({ limit: 9, status: 'published' })
      ]);
      
      const allPosts = postsResponse.data.posts || [];
      
      // Use first 3 posts as featured, remaining as recent
      setFeaturedPosts(allPosts.slice(0, 3));
      setRecentPosts(allPosts.slice(3, 9));
    } catch (error) {
      console.error('Failed to fetch home content:', error);
      
      // Fallback to mock data if API fails
      setFeaturedPosts([
        {
          id: '1',
          title: 'The Future of Web Development: Trends to Watch in 2024',
          slug: 'future-web-development-trends-2024',
          excerpt: 'Discover the latest trends shaping the future of web development, from AI-powered tools to advanced framework capabilities.',
          featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
          author: {
            username: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100'
          },
          category: 'Technology',
          publishedAt: '2024-01-20T10:00:00Z',
          readTime: 8,
          views: 2847
        },
        {
          id: '2',
          title: 'Building Sustainable Design Systems at Scale',
          slug: 'sustainable-design-systems-scale',
          excerpt: 'Learn how to create and maintain design systems that scale with your organization while keeping consistency and efficiency.',
          featuredImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
          author: {
            username: 'Alex Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
          },
          category: 'Design',
          publishedAt: '2024-01-18T14:30:00Z',
          readTime: 10,
          views: 1923
        },
        {
          id: '3',
          title: 'From Startup to Scale: Lessons in Product Management',
          slug: 'startup-scale-product-management-lessons',
          excerpt: 'Essential insights from scaling products from MVP to enterprise level, including common pitfalls and success strategies.',
          featuredImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
          author: {
            username: 'Michael Torres',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
          },
          category: 'Business',
          publishedAt: '2024-01-15T09:15:00Z',
          readTime: 12,
          views: 1456
        }
      ]);

      setRecentPosts([
        {
          id: '4',
          title: 'Advanced React Patterns for Modern Applications',
          slug: 'advanced-react-patterns-modern-apps',
          excerpt: 'Explore sophisticated React patterns that will elevate your component architecture.',
          featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
          category: 'Development',
          publishedAt: '2024-01-14T16:20:00Z',
          readTime: 7
        },
        {
          id: '5',
          title: 'The Art of Technical Writing',
          slug: 'art-technical-writing',
          excerpt: 'Master the skills needed to create clear, effective technical documentation.',
          featuredImage: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400',
          category: 'Writing',
          publishedAt: '2024-01-12T11:45:00Z',
          readTime: 6
        },
        {
          id: '6',
          title: 'Understanding User Experience Psychology',
          slug: 'understanding-ux-psychology',
          excerpt: 'Dive deep into the psychological principles that drive effective user experiences.',
          featuredImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
          category: 'UX Design',
          publishedAt: '2024-01-10T13:30:00Z',
          readTime: 9
        },
        {
          id: '7',
          title: 'API Design Best Practices',
          slug: 'api-design-best-practices',
          excerpt: 'Learn how to design APIs that are intuitive, scalable, and developer-friendly.',
          featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
          category: 'Development',
          publishedAt: '2024-01-08T10:15:00Z',
          readTime: 8
        },
        {
          id: '8',
          title: 'Creative Problem Solving in Tech',
          slug: 'creative-problem-solving-tech',
          excerpt: 'Techniques for approaching complex technical challenges with creative solutions.',
          featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
          category: 'Innovation',
          publishedAt: '2024-01-05T15:00:00Z',
          readTime: 5
        },
        {
          id: '9',
          title: 'The Evolution of Frontend Frameworks',
          slug: 'evolution-frontend-frameworks',
          excerpt: 'A comprehensive look at how frontend frameworks have evolved and where they\'re heading.',
          featuredImage: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400',
          category: 'Technology',
          publishedAt: '2024-01-03T12:00:00Z',
          readTime: 11
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/5 via-[var(--accent)]/5 to-[var(--secondary)]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] block">
                Digital Space
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-[var(--secondary)] mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Discover insights, tutorials, and stories from our community. 
              Stay updated with the latest trends in technology, design, and innovation.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/blog">
                <Button size="lg" icon={BookOpen} iconPosition="right" className="text-lg px-8 py-4">
                  Explore Articles
                </Button>
              </Link>
              
              <Link href="/pages/about">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-[var(--primary)]" />
              <h2 className="text-3xl font-bold text-[var(--foreground)]">
                Featured Articles
              </h2>
            </div>
            <p className="text-lg text-[var(--secondary)] max-w-2xl mx-auto">
              Our most popular and insightful content, curated just for you.
            </p>
          </motion.div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} padding="none" className="overflow-hidden">
                  <div className="w-full h-48 skeleton"></div>
                  <div className="p-6">
                    <LoadingSkeleton lines={4} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card hover padding="none" className="overflow-hidden h-full flex flex-col">
                      {post.featuredImage && (
                        <div className="relative overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-[var(--secondary)] mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-[var(--secondary)] mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.publishedAt)}
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readTime} min
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {post.author.avatar ? (
                              <img
                                src={post.author.avatar}
                                alt={post.author.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-[var(--foreground)]">
                              {post.author.username}
                            </span>
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-[var(--primary)]" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                <h2 className="text-3xl font-bold text-[var(--foreground)]">
                  Latest Articles
                </h2>
              </div>
              <p className="text-lg text-[var(--secondary)]">
                Stay up to date with our newest content and insights.
              </p>
            </div>
            
            <Link href="/blog">
              <Button variant="outline" icon={ArrowRight} iconPosition="right">
                View All Posts
              </Button>
            </Link>
          </motion.div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} padding="none" className="overflow-hidden">
                  <div className="w-full h-32 skeleton"></div>
                  <div className="p-4">
                    <LoadingSkeleton lines={3} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card hover padding="none" className="overflow-hidden h-full">
                      {post.featuredImage && (
                        <div className="relative overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-32 object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-[var(--foreground)] mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-sm text-[var(--secondary)] mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-[var(--secondary)]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime} min read
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              Stay Connected
            </h2>
            <p className="text-lg text-[var(--secondary)] mb-8">
              Subscribe to our newsletter for the latest updates and insights delivered directly to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
              />
              <Button size="lg">Subscribe</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CMS</span>
                </div>
                <span className="text-lg font-semibold text-[var(--foreground)]">Content Hub</span>
              </div>
              <p className="text-[var(--secondary)] mb-4 max-w-md">
                Your source for insights, tutorials, and inspiration in technology, design, and innovation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/blog" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Blog
                </Link>
                <Link href="/pages/about" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  About
                </Link>
                <Link href="/pages/contact" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Contact
                </Link>
                <Link href="/pages/privacy" className="block text-[var(--secondary)] hover:text-[var(--primary)] transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Categories</h3>
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