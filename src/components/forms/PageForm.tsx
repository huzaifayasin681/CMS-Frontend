'use client';

import React, { useState, useEffect } from 'react';
import { Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import { pagesAPI } from '@/lib/api';

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  template: 'default' | 'full-width' | 'minimal' | 'landing' | 'contact' | 'about';
  status: 'draft' | 'published';
  showInMenu: boolean;
  menuOrder: number;
  isHomePage: boolean;
  parentPage?: string;
  customCss?: string;
  customJs?: string;
  seoTitle?: string;
  seoDescription?: string;
  // Template-specific fields
  ctaText?: string;
  phone?: string;
  email?: string;
  address?: string;
  yearsExperience?: string;
  customers?: string;
  projects?: string;
  teamSize?: string;
}

interface PageFormProps {
  pageId?: string;
  onSave?: (page: any) => void;
  onCancel?: () => void;
}

export const PageForm: React.FC<PageFormProps> = ({ pageId, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    template: 'default',
    status: 'draft',
    showInMenu: true,
    menuOrder: 0,
    isHomePage: false,
    parentPage: '',
    customCss: '',
    customJs: '',
    seoTitle: '',
    seoDescription: '',
    // Template-specific fields
    ctaText: '',
    phone: '',
    email: '',
    address: '',
    yearsExperience: '',
    customers: '',
    projects: '',
    teamSize: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (pageId && pageId !== 'undefined' && pageId.trim()) {
      fetchPage();
    }
  }, [pageId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && (!pageId || pageId === 'undefined' || !pageId.trim())) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\\s-]/g, '')
        .replace(/\\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, pageId]);

  const fetchPage = async () => {
    if (!pageId || pageId === 'undefined' || !pageId.trim()) {
      console.warn('Invalid pageId provided to fetchPage:', pageId);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await pagesAPI.getPage(pageId);
      const page = response.data.page || response.data; // Handle nested response structure
      
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || '',
        excerpt: page.excerpt || '',
        featuredImage: page.featuredImage || '',
        template: page.template || 'default',
        status: page.status || 'draft',
        showInMenu: page.showInMenu !== undefined ? page.showInMenu : true,
        menuOrder: page.menuOrder || 0,
        isHomePage: page.isHomePage || false,
        parentPage: page.parentPage?._id || page.parentPage || '',
        customCss: page.customCss || '',
        customJs: page.customJs || '',
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        // Template-specific fields
        ctaText: page.ctaText || '',
        phone: page.phone || '',
        email: page.email || '',
        address: page.address || '',
        yearsExperience: page.yearsExperience || '',
        customers: page.customers || '',
        projects: page.projects || '',
        teamSize: page.teamSize || ''
      });
    } catch (error) {
      console.error('Failed to fetch page:', error);
      showToast.error('Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle template change with content auto-fill
  const handleTemplateChange = (newTemplate: string) => {
    const wasEmpty = !formData.content.trim();
    
    setFormData(prev => ({
      ...prev,
      template: newTemplate as any,
      // Auto-fill content only if current content is empty
      content: wasEmpty ? getContentPlaceholderForTemplate(newTemplate) : prev.content
    }));
  };

  const getContentPlaceholderForTemplate = (template: string) => {
    switch (template) {
      case 'landing':
        return `<h2>Hero Section</h2>
<p>Compelling headline and description for your landing page...</p>

<h2>Features</h2>
<div class="grid grid-cols-3 gap-8">
  <div>
    <h3>Feature 1</h3>
    <p>Description of your first feature...</p>
  </div>
  <div>
    <h3>Feature 2</h3>
    <p>Description of your second feature...</p>
  </div>
  <div>
    <h3>Feature 3</h3>
    <p>Description of your third feature...</p>
  </div>
</div>

<h2>Call to Action</h2>
<p>Encourage visitors to take action...</p>`;

      case 'contact':
        return `<h2>Get In Touch</h2>
<p>We would love to hear from you! Contact us using the information below or fill out the contact form.</p>

<h2>Contact Information</h2>
<ul>
  <li><strong>Address:</strong> 123 Business Street, Suite 100, City, State 12345</li>
  <li><strong>Phone:</strong> +1 (555) 123-4567</li>
  <li><strong>Email:</strong> hello@example.com</li>
</ul>

<h2>Business Hours</h2>
<p>Monday - Friday: 9:00 AM - 6:00 PM<br>
Saturday: 10:00 AM - 4:00 PM<br>
Sunday: Closed</p>`;

      case 'about':
        return `<h2>Our Story</h2>
<p>Tell your company's story, mission, and values...</p>

<h2>Our Mission</h2>
<p>Describe what drives your organization...</p>

<h2>Our Team</h2>
<p>Introduce your team members and their expertise...</p>

<h2>Our Values</h2>
<ul>
  <li><strong>Innovation:</strong> We constantly seek new solutions</li>
  <li><strong>Quality:</strong> We deliver excellence in everything</li>
  <li><strong>Integrity:</strong> We conduct business with honesty</li>
</ul>`;

      case 'minimal':
        return `Write your content with simple, clean formatting. Focus on readability and clear messaging.

Use short paragraphs and avoid complex layouts for the best minimal experience.`;

      case 'full-width':
        return `<div class="grid grid-cols-2 gap-8">
  <div>
    <h2>Left Column</h2>
    <p>Content for the left side...</p>
  </div>
  <div>
    <h2>Right Column</h2>
    <p>Content for the right side...</p>
  </div>
</div>

<h2>Full Width Section</h2>
<p>This template supports wide layouts and multiple columns...</p>`;

      default:
        return '';
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      showToast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      showToast.error('Content is required');
      return;
    }

    setIsSaving(true);
    try {
      const pageData = {
        ...formData,
        status,
        // Convert empty strings to null for optional ObjectId fields
        parentPage: formData.parentPage && formData.parentPage.trim() ? formData.parentPage : null,
        customCss: formData.customCss && formData.customCss.trim() ? formData.customCss : null,
        customJs: formData.customJs && formData.customJs.trim() ? formData.customJs : null,
        seoTitle: formData.seoTitle && formData.seoTitle.trim() ? formData.seoTitle : null,
        seoDescription: formData.seoDescription && formData.seoDescription.trim() ? formData.seoDescription : null
      };

      let response;
      if (pageId && pageId !== 'undefined' && pageId.trim()) {
        response = await pagesAPI.updatePage(pageId, pageData);
        showToast.success(`Page ${status === 'published' ? 'published' : 'saved as draft'} successfully`);
      } else {
        response = await pagesAPI.createPage(pageData);
        showToast.success(`Page ${status === 'published' ? 'published' : 'created as draft'} successfully`);
      }

      if (onSave) {
        onSave(response.data.page || response.data);
      }
    } catch (error: any) {
      console.error('Failed to save page:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save page';
      showToast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const templates = [
    { value: 'default', label: 'Default', description: 'Standard page layout' },
    { value: 'full-width', label: 'Full Width', description: 'Full width layout without sidebar' },
    { value: 'minimal', label: 'Minimal', description: 'Clean, minimal design' },
    { value: 'landing', label: 'Landing Page', description: 'Marketing/promotional page layout' },
    { value: 'contact', label: 'Contact', description: 'Contact form and information layout' },
    { value: 'about', label: 'About', description: 'Company/team information layout' }
  ];

  // Template-specific content helpers
  const getContentPlaceholder = () => {
    switch (formData.template) {
      case 'landing':
        return `<h2>Hero Section</h2>
<p>Compelling headline and description for your landing page...</p>

<h2>Features</h2>
<div class="grid grid-cols-3 gap-8">
  <div>
    <h3>Feature 1</h3>
    <p>Description of your first feature...</p>
  </div>
  <div>
    <h3>Feature 2</h3>
    <p>Description of your second feature...</p>
  </div>
  <div>
    <h3>Feature 3</h3>
    <p>Description of your third feature...</p>
  </div>
</div>

<h2>Call to Action</h2>
<p>Encourage visitors to take action...</p>`;

      case 'contact':
        return `<h2>Get In Touch</h2>
<p>We would love to hear from you! Contact us using the information below or fill out the contact form.</p>

<h2>Contact Information</h2>
<ul>
  <li><strong>Address:</strong> 123 Business Street, Suite 100, City, State 12345</li>
  <li><strong>Phone:</strong> +1 (555) 123-4567</li>
  <li><strong>Email:</strong> hello@example.com</li>
</ul>

<h2>Business Hours</h2>
<p>Monday - Friday: 9:00 AM - 6:00 PM<br>
Saturday: 10:00 AM - 4:00 PM<br>
Sunday: Closed</p>`;

      case 'about':
        return `<h2>Our Story</h2>
<p>Tell your company's story, mission, and values...</p>

<h2>Our Mission</h2>
<p>Describe what drives your organization...</p>

<h2>Our Team</h2>
<p>Introduce your team members and their expertise...</p>

<h2>Our Values</h2>
<ul>
  <li><strong>Innovation:</strong> We constantly seek new solutions</li>
  <li><strong>Quality:</strong> We deliver excellence in everything</li>
  <li><strong>Integrity:</strong> We conduct business with honesty</li>
</ul>`;

      case 'minimal':
        return `Write your content with simple, clean formatting. Focus on readability and clear messaging.

Use short paragraphs and avoid complex layouts for the best minimal experience.`;

      case 'full-width':
        return `<div class="grid grid-cols-2 gap-8">
  <div>
    <h2>Left Column</h2>
    <p>Content for the left side...</p>
  </div>
  <div>
    <h2>Right Column</h2>
    <p>Content for the right side...</p>
  </div>
</div>

<h2>Full Width Section</h2>
<p>This template supports wide layouts and multiple columns...</p>`;

      default:
        return 'Write your page content here using HTML formatting...';
    }
  };

  const getContentRows = () => {
    switch (formData.template) {
      case 'landing':
      case 'about':
        return 20;
      case 'contact':
        return 18;
      case 'full-width':
        return 16;
      case 'minimal':
        return 12;
      default:
        return 15;
    }
  };

  const getContentHint = () => {
    switch (formData.template) {
      case 'landing':
        return 'Landing pages work best with sections like hero, features, testimonials, and call-to-action';
      case 'contact':
        return 'Contact pages will automatically include a contact form and contact information display';
      case 'about':
        return 'About pages work well with company story, team info, values, and statistics';
      case 'minimal':
        return 'Keep content simple and focused for the best minimal reading experience';
      case 'full-width':
        return 'Use grid layouts and wide content areas to take advantage of the full-width template';
      default:
        return 'Standard page layout with sidebar and content area';
    }
  };

  // Template-specific form fields
  const renderTemplateSpecificFields = () => {
    switch (formData.template) {
      case 'landing':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Landing Page Tips</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Use compelling headlines and clear value propositions</li>
                <li>• Include customer testimonials and social proof</li>
                <li>• Add strong call-to-action buttons</li>
                <li>• Keep forms simple and conversion-focused</li>
              </ul>
            </div>
            
            {/* Call-to-Action Text */}
            <Input
              label="Primary CTA Text"
              value={formData.ctaText || ''}
              onChange={(e) => handleInputChange('ctaText', e.target.value)}
              placeholder="Get Started Free"
              hint="Text for your main call-to-action button"
            />
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Contact Page Features</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Contact form will be automatically added</li>
                <li>• Include your business hours and location</li>
                <li>• Add multiple contact methods</li>
                <li>• Consider adding a map or directions</li>
              </ul>
            </div>

            {/* Contact Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="hello@example.com"
              />
            </div>
            
            <Input
              label="Address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Business Street, Suite 100, City, State 12345"
            />
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">About Page Elements</h4>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Tell your company story and mission</li>
                <li>• Highlight team members and expertise</li>
                <li>• Include company values and culture</li>
                <li>• Add statistics and achievements</li>
              </ul>
            </div>

            {/* Company Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Years Experience"
                value={formData.yearsExperience || ''}
                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                placeholder="10+"
              />
              <Input
                label="Happy Customers"
                value={formData.customers || ''}
                onChange={(e) => handleInputChange('customers', e.target.value)}
                placeholder="500+"
              />
              <Input
                label="Projects Completed"
                value={formData.projects || ''}
                onChange={(e) => handleInputChange('projects', e.target.value)}
                placeholder="1,000+"
              />
              <Input
                label="Team Members"
                value={formData.teamSize || ''}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
                placeholder="25+"
              />
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Minimal Template Guidelines</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Focus on typography and readability</li>
              <li>• Use simple, clean formatting</li>
              <li>• Avoid complex layouts and widgets</li>
              <li>• Keep content concise and focused</li>
            </ul>
          </div>
        );

      case 'full-width':
        return (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">Full-Width Template Tips</h4>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>• Use grid layouts for better organization</li>
              <li>• Take advantage of wide content areas</li>
              <li>• Include large images and media</li>
              <li>• Perfect for portfolios and showcases</li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {(pageId && pageId !== 'undefined' && pageId.trim()) ? 'Edit Page' : 'Create New Page'}
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            icon={Eye}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="space-y-4">
              {/* Title */}
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter page title..."
                required
              />

              {/* Slug */}
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="page-url-slug"
                hint="URL-friendly version of the title"
              />

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of the page..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical"
                />
              </div>

              {/* Content - Template Specific */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Content
                </label>
                {showPreview ? (
                  <div 
                    className="min-h-[300px] p-4 border border-[var(--border)] rounded-lg bg-[var(--surface)] prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                ) : (
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder={getContentPlaceholder()}
                    rows={getContentRows()}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical font-mono text-sm"
                    required
                  />
                )}
                {getContentHint() && (
                  <p className="text-xs text-[var(--secondary)] mt-1">
                    {getContentHint()}
                  </p>
                )}
              </div>

              {/* Template-Specific Fields */}
              {renderTemplateSpecificFields()}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Publish
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--secondary)]">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  formData.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {formData.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleSave('draft')}
                  loading={isSaving}
                  variant="outline"
                  icon={Save}
                  fullWidth
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSave('published')}
                  loading={isSaving}
                  icon={Save}
                  fullWidth
                >
                  {formData.status === 'published' ? 'Update' : 'Publish'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Page Settings */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Page Settings
            </h3>
            <div className="space-y-4">
              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Template
                </label>
                <select
                  value={formData.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                >
                  {templates.map(template => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--secondary)] mt-1">
                  {templates.find(t => t.value === formData.template)?.description}
                </p>
              </div>

              {/* Menu Settings */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showInMenu}
                    onChange={(e) => handleInputChange('showInMenu', e.target.checked)}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Show in menu
                  </span>
                </label>
              </div>

              {formData.showInMenu && (
                <Input
                  label="Menu Order"
                  type="number"
                  value={formData.menuOrder}
                  onChange={(e) => handleInputChange('menuOrder', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  hint="Lower numbers appear first"
                />
              )}

              {/* Homepage Setting */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHomePage}
                    onChange={(e) => handleInputChange('isHomePage', e.target.checked)}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Set as homepage
                  </span>
                </label>
                <p className="text-xs text-[var(--secondary)] mt-1">
                  Only one page can be the homepage
                </p>
              </div>

              {/* Parent Page */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Parent Page
                </label>
                <select
                  value={formData.parentPage}
                  onChange={(e) => handleInputChange('parentPage', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                >
                  <option value="">No parent (top level)</option>
                  {/* TODO: Populate with actual pages */}
                </select>
                <p className="text-xs text-[var(--secondary)] mt-1">
                  Create a page hierarchy by selecting a parent page
                </p>
              </div>
            </div>
          </Card>

          {/* Featured Image */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Featured Image
            </h3>
            <div className="space-y-3">
              <Input
                label="Image URL"
                value={formData.featuredImage}
                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {formData.featuredImage && (
                <img
                  src={formData.featuredImage}
                  alt="Featured"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </Card>

          {/* SEO */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              SEO Settings
            </h3>
            <div className="space-y-4">
              <Input
                label="SEO Title"
                value={formData.seoTitle}
                onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                placeholder="Optimized title for search engines"
                hint={`${formData.seoTitle?.length || 0}/60 characters`}
              />
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical"
                />
                <p className="text-xs text-[var(--secondary)] mt-1">
                  {formData.seoDescription?.length || 0}/160 characters
                </p>
              </div>
            </div>
          </Card>

          {/* Custom Code */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Custom Code
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={formData.customCss}
                  onChange={(e) => handleInputChange('customCss', e.target.value)}
                  placeholder="/* Add custom CSS styles here */"
                  rows={6}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical font-mono text-sm"
                />
                <p className="text-xs text-[var(--secondary)] mt-1">
                  Custom CSS will be applied only to this page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Custom JavaScript
                </label>
                <textarea
                  value={formData.customJs}
                  onChange={(e) => handleInputChange('customJs', e.target.value)}
                  placeholder="// Add custom JavaScript here"
                  rows={6}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-vertical font-mono text-sm"
                />
                <p className="text-xs text-[var(--secondary)] mt-1">
                  Custom JavaScript will be executed on this page
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};