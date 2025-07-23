'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  ArrowLeft, 
  Share2, 
  Heart, 
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { postsAPI } from '@/lib/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  likes: number;
  status: 'published' | 'draft';
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  readTime: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      // First try to find post by slug in all posts
      const postsResponse = await postsAPI.getPosts({ status: 'published' });
      const allPosts = postsResponse.data.posts || [];
      const foundPost = allPosts.find((p: any) => p.slug === slug);
      
      if (foundPost) {
        setPost(foundPost);
        
        // Fetch related posts from same category
        const relatedPosts = allPosts
          .filter((p: any) => p.category === foundPost.category && p.id !== foundPost.id)
          .slice(0, 3);
        setRelatedPosts(relatedPosts);
      } else {
        // Post not found
        setPost(null);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      // Fallback to mock data if API fails
      setPost({
        id: '1',
        title: 'Getting Started with Modern Web Development',
        slug: 'getting-started-modern-web-development',
        content: `
          <h2>Introduction</h2>
          <p>Modern web development has evolved significantly over the past few years. With the introduction of frameworks like React, Vue, and Angular, along with powerful meta-frameworks like Next.js, developers now have unprecedented tools at their disposal.</p>
          
          <h2>The Modern Stack</h2>
          <p>Today web development stack typically includes:</p>
          <ul>
            <li><strong>Frontend Framework:</strong> React, Vue, or Angular</li>
            <li><strong>Meta-framework:</strong> Next.js, Nuxt.js, or SvelteKit</li>
            <li><strong>Styling:</strong> Tailwind CSS or styled-components</li>
            <li><strong>State Management:</strong> Zustand, Redux, or built-in solutions</li>
            <li><strong>Backend:</strong> Node.js, Python, or serverless functions</li>
          </ul>
          
          <h2>Getting Started</h2>
          <p>To begin your journey in modern web development, I recommend starting with these steps:</p>
          
          <h3>1. Learn the Fundamentals</h3>
          <p>Before diving into frameworks, ensure you have a solid understanding of HTML, CSS, and JavaScript. These are the building blocks of web development.</p>
          
          <h3>2. Choose Your Framework</h3>
          <p>React is currently the most popular choice due to its large ecosystem and job market demand. However, Vue and Angular are also excellent options.</p>
          
          <h3>3. Build Projects</h3>
          <p>The best way to learn is by building. Start with small projects and gradually increase complexity.</p>
          
          <h2>Best Practices</h2>
          <p>Here are some essential best practices to follow:</p>
          <ul>
            <li>Write clean, readable code</li>
            <li>Use version control (Git)</li>
            <li>Test your applications</li>
            <li>Optimize for performance</li>
            <li>Follow accessibility guidelines</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Modern web development offers exciting opportunities for creating fast, scalable, and user-friendly applications. By following the practices outlined in this guide, you will be well on your way to becoming a proficient web developer.</p>
        `,
        excerpt: 'Learn the fundamentals of modern web development with React, Next.js, and TypeScript. A comprehensive guide for beginners.',
        featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200',
        author: {
          id: '1',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          bio: 'Full-stack developer with 8+ years of experience in web technologies. Passionate about creating efficient and scalable applications.'
        },
        category: 'technology',
        tags: ['react', 'nextjs', 'typescript', 'web-development'],
        publishedAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        readTime: 8,
        views: 1234,
        likes: 89,
        status: 'published'
      });
      
      setRelatedPosts([
        {
          id: '2',
          title: 'Advanced React Patterns',
          slug: 'advanced-react-patterns',
          excerpt: 'Explore advanced React patterns that will take your development skills to the next level.',
          featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
          publishedAt: '2024-01-12T14:30:00Z',
          readTime: 10
        },
        {
          id: '3',
          title: 'TypeScript Best Practices',
          slug: 'typescript-best-practices',
          excerpt: 'Learn how to write better TypeScript code with these proven best practices.',
          featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
          publishedAt: '2024-01-10T09:15:00Z',
          readTime: 6
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (post) {
        await postsAPI.toggleLike(post.id);
        setIsLiked(!isLiked);
        setPost({ 
          ...post, 
          likes: isLiked ? post.likes - 1 : post.likes + 1 
        });
      }
    } catch (error) {
      showToast.error('Failed to update like');
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          showToast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          showToast.error('Failed to copy link');
        }
        break;
    }
    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSkeleton lines={20} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Post Not Found
          </h1>
          <p className="text-[var(--secondary)] mb-8">
            The post you are looking for does not exist or has been removed.
          </p>
          <Link href="/blog">
            <Button icon={ArrowLeft}>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Back to Blog */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-[var(--primary)] text-white text-sm font-medium rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-[var(--secondary)] leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Post Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-[var(--border)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {post.author.firstName && post.author.lastName
                      ? `${post.author.firstName} ${post.author.lastName}`
                      : post.author.username}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[var(--secondary)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views} views
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Heart}
                onClick={handleLike}
                className={isLiked ? 'text-red-500 border-red-500' : ''}
              >
                {post.likes}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                icon={Bookmark}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? 'text-[var(--primary)] border-[var(--primary)]' : ''}
              />
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Share2}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                />
                
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-lg shadow-lg border border-[var(--glass-border)] py-2 z-10"
                  >
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy Link
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Featured Image */}
        {post.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-lg object-cover max-h-96"
            />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-8 border-t border-[var(--border)]"
        >
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1 bg-[var(--surface)] text-[var(--secondary)] hover:bg-[var(--primary)] hover:text-white rounded-full text-sm transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Author Bio */}
        {post.author.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-8 border-t border-[var(--border)]"
          >
            <Card padding="lg">
              <div className="flex gap-4">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    About {post.author.firstName && post.author.lastName
                      ? `${post.author.firstName} ${post.author.lastName}`
                      : post.author.username}
                  </h3>
                  <p className="text-[var(--secondary)]">{post.author.bio}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-[var(--foreground)] mb-8"
            >
              Related Articles
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <Card hover padding="none" className="overflow-hidden h-full">
                      {relatedPost.featuredImage && (
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-[var(--foreground)] mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-[var(--secondary)] mb-3 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--secondary)]">
                          <Calendar className="w-3 h-3" />
                          {formatDate(relatedPost.publishedAt)}
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          {relatedPost.readTime} min read
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}