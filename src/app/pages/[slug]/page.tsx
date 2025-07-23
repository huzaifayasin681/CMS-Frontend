'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { pagesAPI } from '@/lib/api';
import {
  DefaultTemplate,
  FullWidthTemplate,
  MinimalTemplate,
  LandingTemplate,
  ContactTemplate,
  AboutTemplate
} from '@/components/pages/templates';

interface Page {
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
  template: 'default' | 'full-width' | 'minimal' | 'landing' | 'contact' | 'about';
  isHomePage?: boolean;
  parentPage?: any;
  customCss?: string;
  customJs?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export default function PublicPageView() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    setIsLoading(true);
    try {
      // First try to get all pages and find by slug
      const pagesResponse = await pagesAPI.getPages({ status: 'published' });
      const allPages = pagesResponse.data.pages || [];
      const foundPage = allPages.find((p: any) => p.slug === slug);
      
      if (foundPage) {
        setPage(foundPage);
      } else {
        // Page not found, set to null
        setPage(null);
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
      
      // Fallback to mock data for common pages
      const mockPages: { [key: string]: Page } = {
        'about': {
          id: '1',
          title: 'About Us',
          slug: 'about',
          content: `
            <h2>Our Story</h2>
            <p>Welcome to our company! We are passionate about creating innovative solutions that make a difference in people's lives. Founded in 2020, we have been dedicated to excellence and customer satisfaction.</p>
            
            <h2>Our Mission</h2>
            <p>To provide cutting-edge technology solutions that empower businesses and individuals to achieve their goals. We believe in the power of technology to transform lives and create positive change in the world.</p>
            
            <h2>Our Values</h2>
            <ul>
              <li><strong>Innovation:</strong> We constantly seek new and better ways to solve problems.</li>
              <li><strong>Quality:</strong> We deliver excellence in everything we do.</li>
              <li><strong>Integrity:</strong> We conduct business with honesty and transparency.</li>
              <li><strong>Collaboration:</strong> We work together to achieve common goals.</li>
              <li><strong>Customer Focus:</strong> Our customers are at the heart of everything we do.</li>
            </ul>
            
            <h2>Our Team</h2>
            <p>Our diverse team of experts brings together years of experience in technology, design, and business. We are united by our passion for creating exceptional products and services.</p>
            
            <h2>Contact Us</h2>
            <p>Ready to work with us? Get in touch today to discuss your project and see how we can help you achieve your goals.</p>
          `,
          excerpt: 'Learn about our story, mission, and the team behind our success.',
          featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
          author: {
            id: '1',
            username: 'admin',
            firstName: 'Site',
            lastName: 'Administrator'
          },
          publishedAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          views: 2847,
          status: 'published',
          template: 'default',
          seoTitle: 'About Us - Learn Our Story',
          seoDescription: 'Discover our mission, values, and the team behind our innovative solutions.'
        },
        'contact': {
          id: '2',
          title: 'Contact Us',
          slug: 'contact',
          content: `
            <h2>Get In Touch</h2>
            <p>We would love to hear from you! Whether you have a question about our services, need support, or want to discuss a potential project, our team is here to help.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div>
                <h3>Contact Information</h3>
                <div class="space-y-4">
                  <div>
                    <strong>Address:</strong><br>
                    123 Business Street<br>
                    Suite 100<br>
                    City, State 12345
                  </div>
                  <div>
                    <strong>Phone:</strong><br>
                    +1 (555) 123-4567
                  </div>
                  <div>
                    <strong>Email:</strong><br>
                    hello@example.com
                  </div>
                  <div>
                    <strong>Business Hours:</strong><br>
                    Monday - Friday: 9:00 AM - 6:00 PM<br>
                    Saturday: 10:00 AM - 4:00 PM<br>
                    Sunday: Closed
                  </div>
                </div>
              </div>
              
              <div>
                <h3>Send Us a Message</h3>
                <form class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-1">Name</label>
                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your name">
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your@email.com">
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Subject</label>
                    <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="How can we help?">
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Message</label>
                    <textarea rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tell us more about your inquiry..."></textarea>
                  </div>
                  <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Send Message</button>
                </form>
              </div>
            </div>
            
            <h2>Visit Our Office</h2>
            <p>Feel free to visit us during business hours. We are located in the heart of the business district with convenient parking and public transportation access.</p>
          `,
          excerpt: 'Get in touch with our team. We are here to help with your questions and projects.',
          author: {
            id: '1',
            username: 'admin',
            firstName: 'Site',
            lastName: 'Administrator'
          },
          publishedAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-10T16:20:00Z',
          views: 1523,
          status: 'published',
          template: 'default',
          seoTitle: 'Contact Us - Get In Touch',
          seoDescription: 'Contact our team for support, questions, or to discuss your next project.'
        },
        'privacy': {
          id: '3',
          title: 'Privacy Policy',
          slug: 'privacy',
          content: `
            <h2>Privacy Policy</h2>
            <p><em>Last updated: January 1, 2024</em></p>
            
            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
            
            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
            
            <h3>3. Information Sharing</h3>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations:</p>
            <ul>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
            </ul>
            
            <h3>4. Data Security</h3>
            <p>We take reasonable measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            
            <h3>5. Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your information</li>
              <li>Object to processing</li>
            </ul>
            
            <h3>6. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@example.com.</p>
          `,
          author: {
            id: '1',
            username: 'admin',
            firstName: 'Legal',
            lastName: 'Team'
          },
          publishedAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
          views: 456,
          status: 'published',
          template: 'minimal',
          seoTitle: 'Privacy Policy',
          seoDescription: 'Learn how we collect, use, and protect your personal information.'
        }
      };
      
      setPage(mockPages[slug] || null);
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

  if (!page) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Page Not Found
          </h1>
          <p className="text-[var(--secondary)] mb-8">
            The page you are looking for does not exist or has been removed.
          </p>
          <Link href="/">
            <Button icon={ArrowLeft}>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderTemplate = () => {
    switch (page.template) {
      case 'full-width':
        return <FullWidthTemplate page={page} />;
      case 'minimal':
        return <MinimalTemplate page={page} />;
      case 'landing':
        return <LandingTemplate page={page} />;
      case 'contact':
        return <ContactTemplate page={page} />;
      case 'about':
        return <AboutTemplate page={page} />;
      default:
        return <DefaultTemplate page={page} />;
    }
  };

  const showBackNavigation = !['landing'].includes(page.template);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Back Navigation - Only show for certain templates */}
      {showBackNavigation && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      )}

      {/* Render appropriate template */}
      {renderTemplate()}

      {/* Custom CSS injection */}
      {page.customCss && (
        <style dangerouslySetInnerHTML={{ __html: page.customCss }} />
      )}
      
      {/* Custom JS injection - Note: Use with caution in production */}
      {page.customJs && (
        <script dangerouslySetInnerHTML={{ __html: page.customJs }} />
      )}
    </div>
  );
}