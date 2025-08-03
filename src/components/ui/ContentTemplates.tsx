'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Newspaper, BookOpen, Code, Mail, Users, Zap, X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  category: 'blog' | 'marketing' | 'technical' | 'business';
  content: string;
  tags: string[];
}

const contentTemplates: ContentTemplate[] = [
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Standard blog post with introduction, main content, and conclusion',
    icon: FileText,
    category: 'blog',
    content: `<h2>Introduction</h2>
<p>Start with a compelling introduction that hooks your readers and introduces the main topic.</p>

<h2>Main Content</h2>
<p>Develop your main points here with detailed explanations, examples, and supporting evidence.</p>

<h3>Key Points</h3>
<ul>
  <li>First important point</li>
  <li>Second important point</li>
  <li>Third important point</li>
</ul>

<h2>Conclusion</h2>
<p>Summarize your main points and provide a clear takeaway for your readers.</p>

<hr>

<p><em>What are your thoughts on this topic? Share your comments below!</em></p>`,
    tags: ['blog', 'article', 'standard']
  },
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial or guide format',
    icon: BookOpen,
    category: 'blog',
    content: `<h2>What You'll Learn</h2>
<p>In this guide, you'll learn how to [describe the main objective].</p>

<h2>Prerequisites</h2>
<ul>
  <li>Requirement 1</li>
  <li>Requirement 2</li>
  <li>Requirement 3</li>
</ul>

<h2>Step-by-Step Instructions</h2>

<h3>Step 1: [First Step]</h3>
<p>Detailed explanation of the first step...</p>

<h3>Step 2: [Second Step]</h3>
<p>Detailed explanation of the second step...</p>

<h3>Step 3: [Third Step]</h3>
<p>Detailed explanation of the third step...</p>

<h2>Troubleshooting</h2>
<p>Common issues and how to solve them:</p>
<ul>
  <li><strong>Issue 1:</strong> Solution explanation</li>
  <li><strong>Issue 2:</strong> Solution explanation</li>
</ul>

<h2>Conclusion</h2>
<p>Congratulations! You've successfully [completed objective]. Next steps...</p>`,
    tags: ['tutorial', 'guide', 'how-to', 'step-by-step']
  },
  {
    id: 'news-article',
    name: 'News Article',
    description: 'Professional news article format with headline and structured content',
    icon: Newspaper,
    category: 'blog',
    content: `<h2>Breaking: [News Headline]</h2>
<p><em>[Location, Date] -</em> Lead paragraph with the most important information answering who, what, when, where, and why.</p>

<h3>Background</h3>
<p>Provide context and background information to help readers understand the significance of the news.</p>

<h3>Key Details</h3>
<ul>
  <li>Important fact 1</li>
  <li>Important fact 2</li>
  <li>Important fact 3</li>
</ul>

<blockquote>
  <p>"Include relevant quotes from key stakeholders or experts."</p>
  <cite>- Name, Title, Organization</cite>
</blockquote>

<h3>Impact</h3>
<p>Explain the potential impact or implications of this news.</p>

<h3>What's Next</h3>
<p>Outline expected developments or next steps in the story.</p>

<hr>

<p><em>This is a developing story. More updates to follow.</em></p>`,
    tags: ['news', 'journalism', 'breaking', 'update']
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Announcement template for new product or feature launches',
    icon: Zap,
    category: 'marketing',
    content: `<h2>🚀 Introducing [Product Name]</h2>
<p>We're excited to announce the launch of [Product Name], a [brief description] designed to [main benefit].</p>

<h3>What is [Product Name]?</h3>
<p>Detailed description of the product and its primary purpose...</p>

<h3>Key Features</h3>
<ul>
  <li><strong>Feature 1:</strong> Benefit explanation</li>
  <li><strong>Feature 2:</strong> Benefit explanation</li>
  <li><strong>Feature 3:</strong> Benefit explanation</li>
</ul>

<h3>Who is it for?</h3>
<p>Description of the target audience and use cases...</p>

<h3>Pricing & Availability</h3>
<p>Pricing information and how to get started...</p>

<h3>Get Started Today</h3>
<p>Call-to-action with links to sign up, try, or purchase...</p>

<blockquote>
  <p>"Customer testimonial or quote from company leadership about the launch."</p>
  <cite>- Name, Title</cite>
</blockquote>`,
    tags: ['product', 'launch', 'announcement', 'marketing']
  },
  {
    id: 'technical-documentation',
    name: 'Technical Documentation',
    description: 'Comprehensive technical documentation template',
    icon: Code,
    category: 'technical',
    content: `<h2>API Documentation: [Endpoint Name]</h2>

<h3>Overview</h3>
<p>Brief description of what this API endpoint does...</p>

<h3>Authentication</h3>
<p>Authentication requirements and method...</p>

<h3>Request</h3>
<h4>Endpoint</h4>
<pre><code>POST /api/v1/example</code></pre>

<h4>Headers</h4>
<pre><code>Content-Type: application/json
Authorization: Bearer {token}</code></pre>

<h4>Parameters</h4>
<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>param1</td>
      <td>string</td>
      <td>Yes</td>
      <td>Description of parameter</td>
    </tr>
  </tbody>
</table>

<h3>Response</h3>
<h4>Success Response (200 OK)</h4>
<pre><code>{
  "success": true,
  "data": {
    "id": "12345",
    "name": "Example"
  }
}</code></pre>

<h4>Error Responses</h4>
<pre><code>400 Bad Request
{
  "error": "Invalid parameters"
}</code></pre>

<h3>Examples</h3>
<h4>cURL</h4>
<pre><code>curl -X POST https://api.example.com/v1/example \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token" \\
  -d '{"param1": "value"}'</code></pre>`,
    tags: ['api', 'documentation', 'technical', 'reference']
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Email newsletter template with sections and formatting',
    icon: Mail,
    category: 'marketing',
    content: `<h2>📧 [Newsletter Name] - [Date]</h2>
<p><em>Your weekly dose of [topic/industry] insights and updates</em></p>

<hr>

<h3>🔥 This Week's Highlights</h3>
<ul>
  <li><strong>Highlight 1:</strong> Brief description</li>
  <li><strong>Highlight 2:</strong> Brief description</li>
  <li><strong>Highlight 3:</strong> Brief description</li>
</ul>

<h3>📊 Industry News</h3>
<p><strong>[News Item 1]</strong><br>
Brief summary of the news item...</p>

<p><strong>[News Item 2]</strong><br>
Brief summary of the news item...</p>

<h3>💡 Tip of the Week</h3>
<blockquote>
  <p>Share a valuable tip or insight related to your industry or expertise.</p>
</blockquote>

<h3>📖 Recommended Reading</h3>
<ul>
  <li><a href="#">Article Title 1</a> - Brief description</li>
  <li><a href="#">Article Title 2</a> - Brief description</li>
</ul>

<h3>🎯 What's Coming Next Week</h3>
<p>Preview of upcoming content or events...</p>

<hr>

<p><em>Thanks for reading! Forward this to a friend who might find it useful.</em></p>
<p><a href="#">Unsubscribe</a> | <a href="#">View in browser</a></p>`,
    tags: ['newsletter', 'email', 'marketing', 'updates']
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Business case study template with problem, solution, and results',
    icon: Users,
    category: 'business',
    content: `<h2>Case Study: [Client/Project Name]</h2>

<h3>Client Overview</h3>
<p>Brief description of the client, their industry, and company size...</p>

<h3>The Challenge</h3>
<p>Detailed description of the problem or challenge the client faced...</p>

<h3>Our Solution</h3>
<p>Explain the approach taken to solve the problem...</p>

<h4>Implementation Process</h4>
<ol>
  <li>Phase 1: Description</li>
  <li>Phase 2: Description</li>
  <li>Phase 3: Description</li>
</ol>

<h3>Results</h3>
<h4>Key Metrics</h4>
<ul>
  <li><strong>Metric 1:</strong> X% improvement</li>
  <li><strong>Metric 2:</strong> X% increase</li>
  <li><strong>Metric 3:</strong> X% reduction</li>
</ul>

<blockquote>
  <p>"Client testimonial about the results achieved and their experience working with you."</p>
  <cite>- Client Name, Title, Company</cite>
</blockquote>

<h3>Key Takeaways</h3>
<ul>
  <li>Lesson learned 1</li>
  <li>Lesson learned 2</li>
  <li>Lesson learned 3</li>
</ul>

<h3>Next Steps</h3>
<p>Information about ongoing work or future plans...</p>`,
    tags: ['case-study', 'business', 'results', 'testimonial']
  }
];

interface ContentTemplatesProps {
  onSelectTemplate: (content: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const ContentTemplates: React.FC<ContentTemplatesProps> = ({
  onSelectTemplate,
  onClose,
  isOpen
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'blog', name: 'Blog' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'technical', name: 'Technical' },
    { id: 'business', name: 'Business' }
  ];

  const filteredTemplates = contentTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: ContentTemplate) => {
    onSelectTemplate(template.content);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--background)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Content Templates</h2>
                  <p className="text-[var(--secondary)] mt-1">Choose a template to start with</p>
                </div>
                <Button variant="outline" onClick={onClose} icon={X}>
                  Close
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className="h-full cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                              <IconComponent size={20} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--foreground)]">{template.name}</h3>
                              <span className="text-xs px-2 py-1 rounded-full bg-[var(--surface)] text-[var(--secondary)] capitalize">
                                {template.category}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-[var(--secondary)] mb-3 line-clamp-2">
                            {template.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)]"
                              >
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="text-xs px-2 py-1 rounded bg-[var(--surface)] text-[var(--secondary)]">
                                +{template.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-[var(--secondary)] mb-4" />
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No templates found</h3>
                  <p className="text-[var(--secondary)]">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};