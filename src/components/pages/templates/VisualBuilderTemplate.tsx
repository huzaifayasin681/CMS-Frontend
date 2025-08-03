'use client';

import React from 'react';
import { ComponentRenderer } from '@/components/visual-builder/ComponentRenderer';
import { PageTemplateProps } from '@/types/page';
import { BuilderData } from '@/types/visual-builder';

export const VisualBuilderTemplate: React.FC<PageTemplateProps> = ({ page }) => {
  // Parse the builder data from the page
  const builderData: any = page.builderData || null;

  if (!builderData || !builderData.blocks || builderData.blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            {page.title}
          </h2>
          <p className="text-[var(--secondary)] mb-8">
            This is a visual builder page, but no content has been created yet.
          </p>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
            <p className="text-sm text-[var(--secondary)]">
              To edit this page, go to the dashboard and use the Visual Builder editor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get root blocks (blocks without a parent)
  const rootBlocks = builderData.blocks
    .filter((block: any) => !block.parentId)
    .sort((a: any, b: any) => a.order - b.order);

  // Recursive function to render a block and its children
  const renderBlock = (block: any, device: 'desktop' | 'tablet' | 'mobile' = 'desktop'): React.ReactNode => {
    const currentStyles = block.styles[device] || {};

    // Get child blocks
    const childBlocks = builderData.blocks
      .filter((b: any) => b.parentId === block.id)
      .sort((a: any, b: any) => a.order - b.order);

    return (
      <div key={block.id} style={currentStyles}>
        <ComponentRenderer
          component={block.component}
          props={block.props}
          styles={currentStyles}
          isPreview={true}
        />
        
        {/* Render children if this is a container-type component */}
        {childBlocks.length > 0 && (
          <div className="visual-builder-children">
            {childBlocks.map((childBlock: any) => renderBlock(childBlock, device))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="visual-builder-page">
      {/* Apply global styles */}
      <style jsx>{`
        .visual-builder-page {
          ${Object.entries(builderData.globalStyles?.desktop || {})
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ')}
        }
        
        @media (max-width: 768px) {
          .visual-builder-page {
            ${Object.entries(builderData.globalStyles?.tablet || {})
              .map(([key, value]) => `${key}: ${value};`)
              .join(' ')}
          }
        }
        
        @media (max-width: 480px) {
          .visual-builder-page {
            ${Object.entries(builderData.globalStyles?.mobile || {})
              .map(([key, value]) => `${key}: ${value};`)
              .join(' ')}
          }
        }
        
        /* Container max-width from settings */
        .visual-builder-page .builder-container {
          max-width: ${builderData.settings?.containerWidth || '1200px'};
          margin: 0 auto;
        }
        
        /* Typography from settings */
        .visual-builder-page {
          font-family: ${builderData.settings?.typography?.fontFamily || 'Inter, sans-serif'};
          font-size: ${builderData.settings?.typography?.fontSize || '16px'};
          line-height: ${builderData.settings?.typography?.lineHeight || '1.5'};
        }
        
        /* Color variables from settings */
        .visual-builder-page {
          --builder-primary: ${builderData.settings?.colors?.primary || '#3b82f6'};
          --builder-secondary: ${builderData.settings?.colors?.secondary || '#64748b'};
          --builder-accent: ${builderData.settings?.colors?.accent || '#f59e0b'};
          --builder-background: ${builderData.settings?.colors?.background || '#ffffff'};
          --builder-foreground: ${builderData.settings?.colors?.foreground || '#0f172a'};
        }
        
        /* Responsive container behavior */
        @media (max-width: 768px) {
          .visual-builder-page .builder-container {
            max-width: 100%;
            padding: 0 16px;
          }
        }
        
        @media (max-width: 480px) {
          .visual-builder-page .builder-container {
            padding: 0 12px;
          }
        }
        
        /* Row responsive behavior */
        .visual-builder-page .builder-row {
          @media (max-width: 768px) {
            flex-direction: column !important;
          }
        }
        
        /* Button hover effects */
        .visual-builder-page .builder-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        /* Image responsive behavior */
        .visual-builder-page .builder-image img {
          max-width: 100%;
          height: auto;
        }
        
        /* Hero section responsive text */
        .visual-builder-page .builder-hero h1 {
          @media (max-width: 768px) {
            font-size: 2.5rem !important;
          }
          @media (max-width: 480px) {
            font-size: 2rem !important;
          }
        }
        
        .visual-builder-page .builder-hero p {
          @media (max-width: 768px) {
            font-size: 1.1rem !important;
          }
          @media (max-width: 480px) {
            font-size: 1rem !important;
          }
        }
        
        /* Testimonial responsive */
        .visual-builder-page .builder-testimonial {
          @media (max-width: 480px) {
            padding: 16px !important;
          }
        }
        
        /* Pricing card responsive */
        .visual-builder-page .builder-pricing-card {
          @media (max-width: 480px) {
            padding: 20px 16px !important;
          }
        }
        
        .visual-builder-page .builder-pricing-card h3 {
          @media (max-width: 480px) {
            font-size: 1.25rem !important;
          }
        }
        
        .visual-builder-page .builder-pricing-card > div:first-of-type > div {
          @media (max-width: 480px) {
            font-size: 2.5rem !important;
          }
        }
      `}</style>

      {/* Render all root blocks */}
      {rootBlocks.map((block: any) => renderBlock(block))}
      
      {/* SEO and Meta Information (hidden) */}
      <div style={{ display: 'none' }}>
        <h1>{page.title}</h1>
        {page.excerpt && <p>{page.excerpt}</p>}
      </div>
    </div>
  );
}