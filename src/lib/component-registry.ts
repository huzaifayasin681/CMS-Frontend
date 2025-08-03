import { ComponentDefinition } from '@/types/visual-builder';

export const componentRegistry: ComponentDefinition[] = [
  // Layout Components
  {
    id: 'container',
    name: 'Container',
    category: 'layout',
    icon: 'box',
    description: 'A responsive container for organizing content',
    defaultProps: {
      maxWidth: '1200px',
      padding: '20px',
    },
    defaultStyles: {
      desktop: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
      tablet: { maxWidth: '768px', padding: '16px' },
      mobile: { maxWidth: '100%', padding: '12px' },
    },
    editableProps: {
      maxWidth: { type: 'text', label: 'Max Width' },
      padding: { type: 'text', label: 'Padding' },
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color', category: 'background' },
      marginTop: { type: 'number', label: 'Margin Top', category: 'spacing', unit: 'px' },
      marginBottom: { type: 'number', label: 'Margin Bottom', category: 'spacing', unit: 'px' },
    },
    canHaveChildren: true,
    allowedChildren: ['row', 'heading', 'text', 'image', 'button'],
  },
  
  {
    id: 'row',
    name: 'Row',
    category: 'layout',
    icon: 'columns',
    description: 'A horizontal row for columns',
    defaultProps: {
      gap: '20px',
      align: 'top',
    },
    defaultStyles: {
      desktop: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
      tablet: { flexDirection: 'column', gap: '16px' },
      mobile: { flexDirection: 'column', gap: '12px' },
    },
    editableProps: {
      gap: { type: 'text', label: 'Gap' },
      align: { 
        type: 'select', 
        label: 'Vertical Alignment',
        options: [
          { value: 'flex-start', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'flex-end', label: 'Bottom' },
          { value: 'stretch', label: 'Stretch' },
        ]
      },
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color', category: 'background' },
      padding: { type: 'text', label: 'Padding', category: 'spacing' },
      borderRadius: { type: 'number', label: 'Border Radius', category: 'border', unit: 'px' },
    },
    canHaveChildren: true,
    allowedChildren: ['column'],
  },

  {
    id: 'column',
    name: 'Column',
    category: 'layout',
    icon: 'layout',
    description: 'A flexible column for content',
    defaultProps: {
      width: 'auto',
    },
    defaultStyles: {
      desktop: { flex: '1' },
      tablet: { flex: '1' },
      mobile: { flex: '1' },
    },
    editableProps: {
      width: { 
        type: 'select', 
        label: 'Width',
        options: [
          { value: 'auto', label: 'Auto' },
          { value: '25%', label: '25%' },
          { value: '33.333%', label: '33%' },
          { value: '50%', label: '50%' },
          { value: '66.666%', label: '66%' },
          { value: '75%', label: '75%' },
          { value: '100%', label: '100%' },
        ]
      },
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color', category: 'background' },
      padding: { type: 'text', label: 'Padding', category: 'spacing' },
      textAlign: { 
        type: 'select', 
        label: 'Text Align', 
        category: 'typography',
        options: ['left', 'center', 'right', 'justify']
      },
    },
    canHaveChildren: true,
    allowedChildren: ['heading', 'text', 'image', 'button', 'spacer'],
  },

  // Content Components
  {
    id: 'heading',
    name: 'Heading',
    category: 'content',
    icon: 'type',
    description: 'Heading text with customizable levels',
    defaultProps: {
      text: 'Your Heading Here',
      level: 'h2',
      align: 'left',
    },
    defaultStyles: {
      desktop: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' },
      tablet: { fontSize: '1.75rem' },
      mobile: { fontSize: '1.5rem' },
    },
    editableProps: {
      text: { type: 'text', label: 'Text' },
      level: { 
        type: 'select', 
        label: 'Heading Level',
        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      align: { 
        type: 'select', 
        label: 'Alignment',
        options: ['left', 'center', 'right']
      },
    },
    styleProps: {
      fontSize: { type: 'number', label: 'Font Size', category: 'typography', unit: 'px' },
      fontWeight: { 
        type: 'select', 
        label: 'Font Weight', 
        category: 'typography',
        options: ['300', '400', '500', '600', '700', '800', '900']
      },
      color: { type: 'color', label: 'Text Color', category: 'typography' },
      marginBottom: { type: 'number', label: 'Margin Bottom', category: 'spacing', unit: 'px' },
      lineHeight: { type: 'number', label: 'Line Height', category: 'typography', step: 0.1 },
    },
    canHaveChildren: false,
  },

  {
    id: 'text',
    name: 'Text',
    category: 'content',
    icon: 'align-left',
    description: 'Paragraph text with rich formatting options',
    defaultProps: {
      text: 'Your text content goes here. You can write multiple paragraphs and format the text as needed.',
      align: 'left',
    },
    defaultStyles: {
      desktop: { fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' },
      tablet: { fontSize: '0.95rem' },
      mobile: { fontSize: '0.9rem' },
    },
    editableProps: {
      text: { type: 'textarea', label: 'Text Content' },
      align: { 
        type: 'select', 
        label: 'Alignment',
        options: ['left', 'center', 'right', 'justify']
      },
    },
    styleProps: {
      fontSize: { type: 'number', label: 'Font Size', category: 'typography', unit: 'px' },
      color: { type: 'color', label: 'Text Color', category: 'typography' },
      lineHeight: { type: 'number', label: 'Line Height', category: 'typography', step: 0.1 },
      marginBottom: { type: 'number', label: 'Margin Bottom', category: 'spacing', unit: 'px' },
      fontWeight: { 
        type: 'select', 
        label: 'Font Weight', 
        category: 'typography',
        options: ['300', '400', '500', '600', '700']
      },
    },
    canHaveChildren: false,
  },

  {
    id: 'button',
    name: 'Button',
    category: 'content',
    icon: 'square',
    description: 'Call-to-action button with hover effects',
    defaultProps: {
      text: 'Click Me',
      url: '#',
      variant: 'primary',
      size: 'medium',
      openInNewTab: false,
    },
    defaultStyles: {
      desktop: { 
        display: 'inline-block',
        padding: '12px 24px',
        borderRadius: '6px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
      tablet: { padding: '10px 20px' },
      mobile: { padding: '8px 16px', fontSize: '0.9rem' },
    },
    editableProps: {
      text: { type: 'text', label: 'Button Text' },
      url: { type: 'text', label: 'Link URL' },
      variant: { 
        type: 'select', 
        label: 'Style',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' },
          { value: 'ghost', label: 'Ghost' },
        ]
      },
      size: { 
        type: 'select', 
        label: 'Size',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ]
      },
      openInNewTab: { type: 'boolean', label: 'Open in New Tab' },
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color', category: 'background' },
      color: { type: 'color', label: 'Text Color', category: 'typography' },
      borderRadius: { type: 'number', label: 'Border Radius', category: 'border', unit: 'px' },
      padding: { type: 'text', label: 'Padding', category: 'spacing' },
      fontSize: { type: 'number', label: 'Font Size', category: 'typography', unit: 'px' },
      fontWeight: { 
        type: 'select', 
        label: 'Font Weight', 
        category: 'typography',
        options: ['300', '400', '500', '600', '700']
      },
    },
    canHaveChildren: false,
  },

  // Media Components
  {
    id: 'image',
    name: 'Image',
    category: 'media',
    icon: 'image',
    description: 'Responsive image with caption support',
    defaultProps: {
      src: 'https://via.placeholder.com/600x400?text=Your+Image',
      alt: 'Image description',
      caption: '',
      width: '100%',
      height: 'auto',
    },
    defaultStyles: {
      desktop: { width: '100%', height: 'auto', borderRadius: '8px' },
      tablet: { width: '100%' },
      mobile: { width: '100%' },
    },
    editableProps: {
      src: { type: 'image', label: 'Image URL' },
      alt: { type: 'text', label: 'Alt Text' },
      caption: { type: 'text', label: 'Caption' },
      width: { type: 'text', label: 'Width' },
      height: { type: 'text', label: 'Height' },
    },
    styleProps: {
      borderRadius: { type: 'number', label: 'Border Radius', category: 'border', unit: 'px' },
      marginBottom: { type: 'number', label: 'Margin Bottom', category: 'spacing', unit: 'px' },
      boxShadow: { type: 'text', label: 'Box Shadow', category: 'effects' },
    },
    canHaveChildren: false,
  },

  {
    id: 'spacer',
    name: 'Spacer',
    category: 'layout',
    icon: 'move-vertical',
    description: 'Empty space for better layout control',
    defaultProps: {
      height: '40px',
    },
    defaultStyles: {
      desktop: { height: '40px', width: '100%' },
      tablet: { height: '30px' },
      mobile: { height: '20px' },
    },
    editableProps: {
      height: { type: 'text', label: 'Height' },
    },
    styleProps: {
      height: { type: 'number', label: 'Height', category: 'spacing', unit: 'px' },
    },
    canHaveChildren: false,
  },

  // Pre-built Sections
  {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'layout',
    icon: 'monitor',
    description: 'Full-width hero section with background',
    defaultProps: {
      title: 'Welcome to Our Website',
      subtitle: 'Create amazing experiences with our platform',
      buttonText: 'Get Started',
      buttonUrl: '#',
      backgroundImage: '',
      overlay: true,
    },
    defaultStyles: {
      desktop: { 
        minHeight: '500px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '80px 20px',
      },
      tablet: { minHeight: '400px', padding: '60px 20px' },
      mobile: { minHeight: '300px', padding: '40px 20px' },
    },
    editableProps: {
      title: { type: 'text', label: 'Hero Title' },
      subtitle: { type: 'textarea', label: 'Hero Subtitle' },
      buttonText: { type: 'text', label: 'Button Text' },
      buttonUrl: { type: 'text', label: 'Button URL' },
      backgroundImage: { type: 'image', label: 'Background Image' },
      overlay: { type: 'boolean', label: 'Dark Overlay' },
    },
    styleProps: {
      minHeight: { type: 'number', label: 'Min Height', category: 'layout', unit: 'px' },
      backgroundColor: { type: 'color', label: 'Background Color', category: 'background' },
      textAlign: { 
        type: 'select', 
        label: 'Text Align', 
        category: 'typography',
        options: ['left', 'center', 'right']
      },
    },
    canHaveChildren: false,
  },

  {
    id: 'testimonial-card',
    name: 'Testimonial',
    category: 'content',
    icon: 'quote',
    description: 'Customer testimonial with photo and details',
    defaultProps: {
      quote: 'This product has completely transformed our business. Highly recommended!',
      name: 'John Doe',
      title: 'CEO, Company Name',
      avatar: 'https://via.placeholder.com/80x80?text=JD',
      rating: 5,
    },
    defaultStyles: {
      desktop: { 
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        marginBottom: '20px',
      },
      tablet: { padding: '24px' },
      mobile: { padding: '20px' },
    },
    editableProps: {
      quote: { type: 'textarea', label: 'Testimonial Quote' },
      name: { type: 'text', label: 'Customer Name' },
      title: { type: 'text', label: 'Customer Title' },
      avatar: { type: 'image', label: 'Customer Photo' },
      rating: { type: 'number', label: 'Rating (1-5)', min: 1, max: 5 },
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color', category: 'background' },
      borderRadius: { type: 'number', label: 'Border Radius', category: 'border', unit: 'px' },
      padding: { type: 'text', label: 'Padding', category: 'spacing' },
      boxShadow: { type: 'text', label: 'Box Shadow', category: 'effects' },
    },
    canHaveChildren: false,
  },

  {
    id: 'pricing-card',
    name: 'Pricing Card',
    category: 'content',
    icon: 'credit-card',
    description: 'Pricing plan card with features list',
    defaultProps: {
      planName: 'Pro Plan',
      price: '$29',
      period: '/month',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
      buttonText: 'Get Started',
      buttonUrl: '#',
      popular: false,
    },
    defaultStyles: {
      desktop: { 
        padding: '40px 30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        textAlign: 'center',
        position: 'relative',
      },
      tablet: { padding: '30px 24px' },
      mobile: { padding: '24px 20px' },
    },
    editableProps: {
      planName: { type: 'text', label: 'Plan Name' },
      price: { type: 'text', label: 'Price' },
      period: { type: 'text', label: 'Billing Period' },
      features: { type: 'textarea', label: 'Features (one per line)' },
      buttonText: { type: 'text', label: 'Button Text' },
      buttonUrl: { type: 'text', label: 'Button URL' },
      popular: { type: 'boolean', label: 'Mark as Popular' },
    },
    styleProps: {
      backgroundColor: { type: 'color', label: 'Background Color', category: 'background' },
      borderColor: { type: 'color', label: 'Border Color', category: 'border' },
      borderRadius: { type: 'number', label: 'Border Radius', category: 'border', unit: 'px' },
      padding: { type: 'text', label: 'Padding', category: 'spacing' },
    },
    canHaveChildren: false,
  },
];

export function getComponentDefinition(componentId: string): ComponentDefinition | null {
  return componentRegistry.find(comp => comp.id === componentId) || null;
}

export function getComponentsByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
  return componentRegistry.filter(comp => comp.category === category);
}

export function getAllCategories(): ComponentDefinition['category'][] {
  const categories = componentRegistry.map(comp => comp.category);
  return Array.from(new Set(categories));
}