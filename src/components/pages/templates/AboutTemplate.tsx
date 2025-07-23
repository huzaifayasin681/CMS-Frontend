'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, Users, Target, Award, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';

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

interface AboutTemplateProps {
  page: PageData;
}

export const AboutTemplate: React.FC<AboutTemplateProps> = ({ page }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We are committed to our mission of creating value and making a positive impact.'
    },
    {
      icon: Users,
      title: 'People-First',
      description: 'Our team and customers are at the heart of everything we do.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every project and interaction.'
    },
    {
      icon: Heart,
      title: 'Passionate',
      description: 'We love what we do and it shows in our work and results.'
    }
  ];

  const stats = [
    { label: 'Years of Experience', value: '10+' },
    { label: 'Happy Customers', value: '500+' },
    { label: 'Projects Completed', value: '1,000+' },
    { label: 'Team Members', value: '25+' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-6">
          {page.title}
        </h1>
        
        {page.excerpt && (
          <p className="text-xl text-[var(--secondary)] leading-relaxed mb-8 max-w-3xl mx-auto">
            {page.excerpt}
          </p>
        )}

        {/* Page Meta */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--secondary)]">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {page.author.firstName && page.author.lastName
              ? `${page.author.firstName} ${page.author.lastName}`
              : page.author.username}
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Updated {formatDate(page.updatedAt)}
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {page.views} views
          </div>
        </div>
      </motion.header>

      {/* Featured Image with Overlay */}
      {page.featuredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-16"
        >
          <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden">
            <img
              src={page.featuredImage}
              alt={page.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Our Story</h2>
              <p className="text-blue-100">Building the future, one project at a time</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card padding="lg" className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[var(--primary)] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--secondary)]">
                  {stat.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="prose prose-lg max-w-none mb-16"
      >
        <div 
          className="about-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </motion.div>

      {/* Values Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Our Values
          </h2>
          <p className="text-lg text-[var(--secondary)] max-w-2xl mx-auto">
            These core values guide everything we do and help us stay true to our mission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card hover padding="lg" className="text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                    {value.title}
                  </h3>
                  <p className="text-[var(--secondary)]">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-16"
      >
        <Card padding="xl" className="text-center bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">
            Meet Our Team
          </h2>
          <p className="text-lg text-[var(--secondary)] mb-8 max-w-3xl mx-auto">
            Our diverse team of experts brings together years of experience in technology, 
            design, and business. We are united by our passion for creating exceptional 
            products and services.
          </p>
          
          {/* Team placeholder - would typically show actual team members */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-[var(--foreground)]">Team Member</div>
                  <div className="text-[var(--secondary)]">Role</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.section>

      {/* Contact CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-16"
      >
        <Card padding="xl" className="text-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Get in touch today to discuss your project and see how we can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-[var(--primary)] rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/pages/services" 
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-[var(--primary)] transition-colors"
            >
              Our Services
            </a>
          </div>
        </Card>
      </motion.section>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="pt-8 border-t border-[var(--border)] text-sm text-[var(--secondary)] text-center"
      >
        <p>
          Last updated on {formatDate(page.updatedAt)} by{' '}
          {page.author.firstName && page.author.lastName
            ? `${page.author.firstName} ${page.author.lastName}`
            : page.author.username}
        </p>
      </motion.div>

      <style jsx>{`
        .about-content :global(h2) {
          font-size: 2rem;
          font-weight: 700;
          margin: 2.5rem 0 1rem 0;
          color: var(--foreground);
        }
        
        .about-content :global(h3) {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          color: var(--foreground);
        }
        
        .about-content :global(p) {
          font-size: 1.125rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
          color: var(--foreground);
        }
        
        .about-content :global(ul) {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        
        .about-content :global(li) {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        
        .about-content :global(blockquote) {
          border-left: 4px solid var(--primary);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: var(--secondary);
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};