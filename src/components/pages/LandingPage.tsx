'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Palette, 
  Users, 
  BarChart3, 
  Sparkles,
  Check
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/auth';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with Next.js and optimized for speed with SSR/SSG support.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'JWT authentication, role-based access control, and data protection.'
    },
    {
      icon: Palette,
      title: 'Beautiful Design',
      description: 'Glassmorphism UI with dark mode and customizable themes.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Multi-user support with different permission levels.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track content performance and engagement metrics.'
    },
    {
      icon: Sparkles,
      title: 'Rich Content Editor',
      description: 'Advanced WYSIWYG editor with auto-save and version history.'
    },
  ];
  
  const benefits = [
    'Drag & drop media management',
    'SEO optimization tools',
    'Mobile-responsive design',
    'Real-time collaboration',
    'Content scheduling',
    'Custom themes & layouts'
  ];
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[var(--foreground)] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Content Hub
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
                CMS
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl sm:text-2xl text-[var(--secondary)] mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              A powerful, modern content management system designed for creators, 
              teams, and businesses who demand excellence.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                <Button size="lg" icon={ArrowRight} iconPosition="right" className="text-lg px-8 py-4">
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                </Button>
              </Link>
              
              <Link href="/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              Everything you need to manage content
            </h2>
            <p className="text-lg text-[var(--secondary)] max-w-2xl mx-auto">
              Built with modern technologies and designed for the future of content management.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover padding="lg" className="h-full text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
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
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-6">
                Why choose Content Hub?
              </h2>
              <p className="text-lg text-[var(--secondary)] mb-8">
                Experience the next generation of content management with our 
                feature-rich platform designed for modern workflows.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[var(--foreground)]">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card glass padding="xl" className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-xl"></div>
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold">CMS</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-[var(--surface)] rounded w-3/4"></div>
                    <div className="h-4 bg-[var(--surface)] rounded w-1/2"></div>
                    <div className="h-4 bg-[var(--surface)] rounded w-5/6"></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to transform your content management?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of creators and teams who trust Content Hub for their content needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-white text-[var(--primary)] hover:bg-blue-50"
                >
                  {isAuthenticated ? 'Access Dashboard' : 'Start Building Today'}
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-[var(--primary)]"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">CMS</span>
              </div>
              <span className="text-lg font-semibold text-[var(--foreground)]">Content Hub</span>
            </div>
            <p className="text-[var(--secondary)] mb-4">
              Built with ❤️ using Next.js, React, and modern web technologies.
            </p>
            <p className="text-sm text-[var(--secondary)]">
              © 2024 Content Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};