'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Eye, 
  Clock,
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/layout/Header';
import { pagesAPI } from '@/lib/api';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PageData } from '@/types/page';

// Page template components
import { DefaultTemplate } from '@/components/pages/templates/DefaultTemplate';
import { FullWidthTemplate } from '@/components/pages/templates/FullWidthTemplate';
import { MinimalTemplate } from '@/components/pages/templates/MinimalTemplate';
import { LandingTemplate } from '@/components/pages/templates/LandingTemplate';
import { ContactTemplate } from '@/components/pages/templates/ContactTemplate';
import { AboutTemplate } from '@/components/pages/templates/AboutTemplate';
import { VisualBuilderTemplate } from '@/components/pages/templates/VisualBuilderTemplate';

export default function PublicPageView() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<PageData | null>(null);
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
      setPage(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[var(--surface)] flex items-center justify-center">
              <div className="text-4xl">🔍</div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Page Not Found
            </h1>
            <p className="text-[var(--secondary)] mb-6">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/">
              <Button icon={ArrowLeft} iconPosition="left">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render appropriate template based on page template
  const renderPageContent = () => {
    const templateProps = { page };
    
    switch (page.template) {
      case 'full-width':
        return <FullWidthTemplate {...templateProps} />;
      case 'minimal':
        return <MinimalTemplate {...templateProps} />;
      case 'landing':
        return <LandingTemplate {...templateProps} />;
      case 'contact':
        return <ContactTemplate {...templateProps} />;
      case 'about':
        return <AboutTemplate {...templateProps} />;
      case 'visual-builder':
        return <VisualBuilderTemplate {...templateProps} />;
      default:
        return <DefaultTemplate {...templateProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* SEO Meta Tags */}
      <head>
        <title>{page.seoTitle || page.title}</title>
        <meta name="description" content={page.seoDescription || page.excerpt} />
        {page.featuredImage && (
          <meta property="og:image" content={page.featuredImage} />
        )}
      </head>

      {/* Header with Navigation */}
      <Header />

      {/* Render page template */}
      {renderPageContent()}
      
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