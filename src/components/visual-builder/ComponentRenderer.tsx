'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface ComponentRendererProps {
  component: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  isPreview: boolean;
}

export function ComponentRenderer({ component, props, styles, isPreview }: ComponentRendererProps) {
  const combinedStyles = {
    ...styles,
    ...(isPreview ? {} : { minHeight: '20px' }),
  };

  switch (component) {
    case 'container':
      return (
        <div style={combinedStyles} className="builder-container">
          {/* Children will be rendered by BuilderBlock */}
        </div>
      );

    case 'row':
      return (
        <div 
          style={{
            ...combinedStyles,
            display: 'flex',
            gap: props.gap || '20px',
            alignItems: props.align || 'flex-start',
          }} 
          className="builder-row"
        >
          {/* Children will be rendered by BuilderBlock */}
        </div>
      );

    case 'column':
      return (
        <div 
          style={{
            ...combinedStyles,
            flex: props.width === 'auto' ? '1' : `0 0 ${props.width}`,
          }} 
          className="builder-column"
        >
          {/* Children will be rendered by BuilderBlock */}
        </div>
      );

    case 'heading':
      const HeadingTag = props.level || 'h2';
      return (
        <HeadingTag 
          style={{
            ...combinedStyles,
            textAlign: props.align || 'left',
          }}
          className="builder-heading"
        >
          {props.text || 'Your Heading Here'}
        </HeadingTag>
      );

    case 'text':
      return (
        <p 
          style={{
            ...combinedStyles,
            textAlign: props.align || 'left',
          }}
          className="builder-text"
        >
          {props.text || 'Your text content goes here. You can write multiple paragraphs and format the text as needed.'}
        </p>
      );

    case 'button':
      const buttonStyles = {
        ...combinedStyles,
        display: 'inline-block',
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      };

      if (isPreview && props.url) {
        return (
          <a 
            href={props.url}
            target={props.openInNewTab ? '_blank' : '_self'}
            rel={props.openInNewTab ? 'noopener noreferrer' : undefined}
            style={buttonStyles}
            className="builder-button"
          >
            {props.text || 'Click Me'}
          </a>
        );
      }

      return (
        <button 
          style={buttonStyles}
          className="builder-button"
          onClick={(e) => !isPreview && e.preventDefault()}
        >
          {props.text || 'Click Me'}
        </button>
      );

    case 'image':
      return (
        <div style={combinedStyles} className="builder-image">
          <img
            src={props.src || 'https://via.placeholder.com/600x400?text=Your+Image'}
            alt={props.alt || 'Image description'}
            style={{
              width: props.width || '100%',
              height: props.height || 'auto',
              maxWidth: '100%',
              display: 'block',
            }}
          />
          {props.caption && (
            <p style={{ 
              marginTop: '8px', 
              fontSize: '0.9em', 
              color: '#666',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {props.caption}
            </p>
          )}
        </div>
      );

    case 'spacer':
      return (
        <div 
          style={{
            ...combinedStyles,
            height: props.height || '40px',
            width: '100%',
          }}
          className="builder-spacer"
        />
      );

    case 'hero-section':
      const heroStyles = {
        ...combinedStyles,
        backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative' as const,
      };

      return (
        <div style={heroStyles} className="builder-hero">
          {props.overlay && props.backgroundImage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: 'inherit'
            }}>
              {props.title || 'Welcome to Our Website'}
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              marginBottom: '2rem',
              color: 'inherit',
              opacity: 0.9
            }}>
              {props.subtitle || 'Create amazing experiences with our platform'}
            </p>
            {props.buttonText && (
              <button style={{
                padding: '12px 24px',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#333',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}>
                {props.buttonText}
              </button>
            )}
          </div>
        </div>
      );

    case 'testimonial-card':
      return (
        <div style={combinedStyles} className="builder-testimonial">
          <div style={{ marginBottom: '16px' }}>
            {Array.from({ length: props.rating || 5 }).map((_, i) => (
              <Star key={i} className="inline w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote style={{ 
            fontSize: '1.1rem', 
            fontStyle: 'italic',
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            "{props.quote || 'This product has completely transformed our business. Highly recommended!'}"
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={props.avatar || 'https://via.placeholder.com/80x80?text=JD'}
              alt={props.name || 'Customer'}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {props.name || 'John Doe'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {props.title || 'CEO, Company Name'}
              </div>
            </div>
          </div>
        </div>
      );

    case 'pricing-card':
      const features = typeof props.features === 'string' 
        ? props.features.split('\n').filter(f => f.trim())
        : props.features || ['Feature 1', 'Feature 2', 'Feature 3'];

      return (
        <div style={combinedStyles} className="builder-pricing-card">
          {props.popular && (
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '4px 16px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '600',
            }}>
              Most Popular
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '8px' 
            }}>
              {props.planName || 'Pro Plan'}
            </h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
              {props.price || '$29'}
              <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>
                {props.period || '/month'}
              </span>
            </div>
          </div>

          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            {features.map((feature: string, index: number) => (
              <li key={index} style={{ 
                padding: '8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#10b981' }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <button style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: props.popular ? '#3b82f6' : '#f3f4f6',
            color: props.popular ? 'white' : '#374151',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            {props.buttonText || 'Get Started'}
          </button>
        </div>
      );

    default:
      return (
        <div 
          style={{
            ...combinedStyles,
            padding: '20px',
            border: '2px dashed #ccc',
            textAlign: 'center',
            color: '#666',
          }}
          className="builder-unknown"
        >
          Unknown component: {component}
        </div>
      );
  }
}