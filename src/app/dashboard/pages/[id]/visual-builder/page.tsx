'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { VisualBuilder } from '@/components/visual-builder/VisualBuilder';
import { useVisualBuilder } from '@/contexts/VisualBuilderContext';
import { pagesAPI } from '@/lib/api';
import { PageData } from '@/types/page';
import { BuilderData } from '@/types/visual-builder';
import Link from 'next/link';

export default function VisualBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  const fetchPage = async () => {
    setIsLoading(true);
    try {
      const response = await pagesAPI.getPage(pageId);
      setPage(response.data);
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (builderData: BuilderData) => {
    if (!page) return;

    setIsSaving(true);
    try {
      const updateData = {
        ...page,
        template: 'visual-builder' as const,
        builderData,
        isVisualBuilder: true,
      };

      await pagesAPI.updatePage(pageId, updateData);
      setLastSaved(new Date());
      
      // Update local page state
      setPage({ ...page, builderData, isVisualBuilder: true });
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (page) {
      window.open(`/pages/${page.slug}`, '_blank');
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
              <div className="text-4xl">📄</div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Page Not Found
            </h1>
            <p className="text-[var(--secondary)] mb-6">
              The page you are trying to edit does not exist.
            </p>
            <Link href="/dashboard/pages">
              <Button icon={ArrowLeft} iconPosition="left">
                Back to Pages
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Back button and page info */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/pages">
              <Button variant="ghost" size="sm" icon={ArrowLeft} iconPosition="left">
                Pages
              </Button>
            </Link>
            <div className="border-l border-[var(--border)] pl-4">
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                Visual Builder
              </h1>
              <p className="text-sm text-[var(--secondary)]">
                {page.title}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Save Status */}
            {lastSaved && (
              <div className="text-xs text-[var(--secondary)]">
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}

            {/* Preview Button */}
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              iconPosition="left"
              onClick={handlePreview}
            >
              Preview
            </Button>

            {/* Save Button */}
            <VisualBuilderSaveButton onSave={handleSave} isSaving={isSaving} />
          </div>
        </div>
      </div>

      {/* Visual Builder */}
      <VisualBuilder
        initialData={page.builderData}
        onSave={handleSave}
      />
    </div>
  );
}

// Save button component that has access to visual builder context
function VisualBuilderSaveButton({ 
  onSave, 
  isSaving 
}: { 
  onSave: (data: BuilderData) => Promise<void>;
  isSaving: boolean;
}) {
  const { state } = useVisualBuilder();

  const handleSave = () => {
    const builderData: BuilderData = {
      blocks: state.blocks,
      globalStyles: state.globalStyles,
      settings: state.settings,
    };
    onSave(builderData);
  };

  return (
    <Button
      onClick={handleSave}
      loading={isSaving}
      icon={Save}
      iconPosition="left"
      size="sm"
    >
      {isSaving ? 'Saving...' : 'Save'}
    </Button>
  );
}