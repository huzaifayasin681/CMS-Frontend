'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Eye, ArrowRight, Search, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { postsAPI } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  views: number;
  status: 'published' | 'draft';
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['all', 'technology', 'design', 'business', 'lifestyle', 'tutorials'];

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        status: 'published',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await postsAPI.getPosts(params);
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // Fallback to mock data if API fails
      setPosts([
        {
          id: '1',
          title: 'Getting Started with Modern Web Development',
          slug: 'getting-started-modern-web-development',
          excerpt: 'Learn the fundamentals of modern web development with React, Next.js, and TypeScript. A comprehensive guide for beginners.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
          author: {
            id: '1',
            username: 'John Doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
          },
          category: 'technology',
          tags: ['react', 'nextjs', 'typescript'],
          publishedAt: '2024-01-15T10:00:00Z',
          readTime: 8,
          views: 1234,
          status: 'published'
        },
        {
          id: '2',
          title: 'Design Principles for Better User Experience',
          slug: 'design-principles-better-user-experience',
          excerpt: 'Explore essential design principles that create intuitive and engaging user experiences in modern applications.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
          author: {
            id: '2',
            username: 'Jane Smith',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100'
          },
          category: 'design',
          tags: ['ux', 'design', 'principles'],
          publishedAt: '2024-01-12T14:30:00Z',
          readTime: 6,
          views: 892,
          status: 'published'
        },
        {
          id: '3',
          title: 'Building Scalable Business Applications',
          slug: 'building-scalable-business-applications',
          excerpt: 'Learn how to architect and build applications that can scale with your business needs and handle growing user bases.',
          content: '',
          featuredImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
          author: {
            id: '3',
            username: 'Mike Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
          },
          category: 'business',
          tags: ['scalability', 'architecture', 'business'],
          publishedAt: '2024-01-10T09:15:00Z',
          readTime: 12,
          views: 567,
          status: 'published'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4">
              Our Blog
            </h1>
            <p className="text-xl text-[var(--secondary)] mb-8 max-w-2xl mx-auto">
              Discover insights, tutorials, and stories from our community of creators and developers.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary)] w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                />
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[var(--secondary)]" />
              <span className="text-sm font-medium text-[var(--foreground)]">Filter by category:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] text-[var(--secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} padding="none" className="overflow-hidden">
                  <div className="w-full h-48 skeleton"></div>
                  <div className="p-6">
                    <LoadingSkeleton lines={4} />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                No posts found
              </h3>
              <p className="text-[var(--secondary)]">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3 line-clamp-2">
                          {post.title}
                        </h2>
                        
                        <p className="text-[var(--secondary)] mb-4 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-[var(--secondary)] mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.publishedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readTime} min read
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
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}