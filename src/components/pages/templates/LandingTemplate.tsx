'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowRight, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageTemplateProps } from '@/types/page';

export const LandingTemplate: React.FC<PageTemplateProps> = ({ page }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/5 to-transparent"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[var(--foreground)] mb-6">
            {page.title}
          </h1>
          
          {page.excerpt && (
            <p className="text-xl sm:text-2xl text-[var(--secondary)] mb-8 leading-relaxed">
              {page.excerpt}
            </p>
          )}

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button size="lg" icon={ArrowRight} iconPosition="right" className="text-lg px-8 py-4">
              {page.ctaText || 'Get Started'}
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Learn More
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-[var(--secondary)]"
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm">Trusted by {page.views.toLocaleString()}+ users</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Image */}
      {page.featuredImage && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-4 sm:px-6 lg:px-8 mb-20"
        >
          <div className="relative max-w-5xl mx-auto">
            <img
              src={page.featuredImage}
              alt={page.title}
              className="w-full rounded-xl shadow-2xl object-cover max-h-[70vh]"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </motion.section>
      )}

      {/* Main Content with Landing Page Structure */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="landing-content prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </motion.section>

      {/* Features Section (if content includes feature list) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-4 sm:px-6 lg:px-8 py-20 bg-[var(--surface)]"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            Why Choose Us?
          </h2>
          <p className="text-lg text-[var(--secondary)] max-w-2xl mx-auto">
            Discover the benefits that make us the right choice for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { title: 'Fast & Reliable', description: 'Built for speed and performance' },
            { title: 'Secure & Trusted', description: 'Your data is safe with us' },
            { title: '24/7 Support', description: 'We are here when you need us' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <Card hover padding="lg" className="text-center h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--secondary)]">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white"
      >
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust our solution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-[var(--primary)] hover:bg-blue-50"
            >
              {page.ctaText || 'Start Free Trial'}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-[var(--primary)]"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Page Meta Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="px-4 sm:px-6 lg:px-8 py-8 border-t border-[var(--border)] text-center"
      >
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
      </motion.div>

      <style jsx>{`
        .landing-content :global(h2) {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin: 3rem 0 1.5rem 0;
          color: var(--foreground);
        }
        
        .landing-content :global(h3) {
          font-size: 1.875rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          color: var(--foreground);
        }
        
        .landing-content :global(p) {
          font-size: 1.125rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
          color: var(--foreground);
        }
        
        .landing-content :global(.grid) {
          display: grid;
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .landing-content :global(.grid-cols-2) {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .landing-content :global(.grid-cols-3) {
          grid-template-columns: repeat(3, 1fr);
        }
        
        @media (max-width: 768px) {
          .landing-content :global(.grid-cols-2),
          .landing-content :global(.grid-cols-3) {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};