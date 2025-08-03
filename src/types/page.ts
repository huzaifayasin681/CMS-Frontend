export interface PageData {
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
  template: 'default' | 'full-width' | 'minimal' | 'landing' | 'contact' | 'about' | 'visual-builder';
  seoTitle?: string;
  seoDescription?: string;
  showInMenu?: boolean;
  menuOrder?: number;
  isHomePage?: boolean;
  parentPage?: any;
  customCss?: string;
  customJs?: string;
  // Template-specific fields
  ctaText?: string;
  phone?: string;
  email?: string;
  address?: string;
  yearsExperience?: string;
  customers?: string;
  projects?: string;
  teamSize?: string;
  // Visual Builder fields
  builderData?: {
    blocks: Array<{
      id: string;
      type: string;
      component: string;
      props: Record<string, any>;
      styles: {
        desktop: Record<string, any>;
        tablet: Record<string, any>;
        mobile: Record<string, any>;
      };
      children?: string[];
      parentId?: string;
      order: number;
    }>;
    globalStyles: {
      desktop: Record<string, any>;
      tablet: Record<string, any>;
      mobile: Record<string, any>;
    };
    settings: {
      containerWidth: string;
      spacing: string;
      typography: Record<string, any>;
      colors: Record<string, any>;
    };
  };
  isVisualBuilder?: boolean;
}

export interface PageTemplateProps {
  page: PageData;
}