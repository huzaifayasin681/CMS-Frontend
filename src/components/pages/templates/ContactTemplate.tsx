'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';

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

interface ContactTemplateProps {
  page: PageData;
}

export const ContactTemplate: React.FC<ContactTemplateProps> = ({ page }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      showToast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@example.com',
      description: 'Send us an email anytime!'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 5pm'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: '123 Business Street, Suite 100',
      description: 'City, State 12345'
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value: 'Monday - Friday: 9:00 AM - 6:00 PM',
      description: 'Saturday: 10:00 AM - 4:00 PM'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
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

      {/* Featured Image */}
      {page.featuredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <img
            src={page.featuredImage}
            alt={page.title}
            className="w-full rounded-lg object-cover max-h-80"
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      {/* Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
            Get in Touch
          </h2>
          <p className="text-[var(--secondary)] mb-8">
            We would love to hear from you! Whether you have a question about our services, 
            need support, or want to discuss a potential project, our team is here to help.
          </p>

          <div className="space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card padding="lg" hover>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)] mb-1">
                          {info.label}
                        </h3>
                        <p className="text-[var(--foreground)] mb-1">
                          {info.value}
                        </p>
                        <p className="text-sm text-[var(--secondary)]">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card padding="lg">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your name"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <Input
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="How can we help?"
                required
              />

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical"
                  required
                />
              </div>

              <Button
                type="submit"
                loading={isSubmitting}
                icon={Send}
                fullWidth
                size="lg"
              >
                Send Message
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Map or Additional Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-16"
      >
        <Card padding="lg" className="text-center">
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Visit Our Office
          </h3>
          <p className="text-[var(--secondary)] mb-6">
            Feel free to visit us during business hours. We are located in the heart of the business district 
            with convenient parking and public transportation access.
          </p>
          
          {/* Placeholder for map */}
          <div className="w-full h-64 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-[var(--primary)] mx-auto mb-2" />
              <p className="text-[var(--secondary)]">Interactive map would be here</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-12 pt-8 border-t border-[var(--border)] text-sm text-[var(--secondary)] text-center"
      >
        <p>
          Last updated on {formatDate(page.updatedAt)} by{' '}
          {page.author.firstName && page.author.lastName
            ? `${page.author.firstName} ${page.author.lastName}`
            : page.author.username}
        </p>
      </motion.div>
    </div>
  );
};