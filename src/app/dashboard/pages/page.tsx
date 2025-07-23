'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Globe,
  User,
  Calendar,
  MoreVertical,
  Home,
  FileText,
  Layout,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/auth';
import { pagesAPI } from '@/lib/api';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  template: 'default' | 'full-width' | 'minimal' | 'landing' | 'contact' | 'about';
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  showInMenu: boolean;
  menuOrder: number;
  isHomePage?: boolean;
  parentPage?: any;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  
  const permissions = usePermissions();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await pagesAPI.getPages();
      const pagesData = response.data.pages || [];
      
      // Transform API data to match our interface
      const transformedPages = pagesData.map((page: any) => ({
        ...page,
        id: page._id || page.id, // Map _id to id for consistency
        author: {
          id: page.author._id || page.author.id,
          username: page.author.username,
          firstName: page.author.firstName,
          lastName: page.author.lastName,
          avatar: page.author.avatar
        },
        views: page.views || 0
      }));
      
      setPages(transformedPages);
      setFilteredPages(transformedPages);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      showToast.error('Failed to load pages');
      
      // Fallback to empty array on error
      setPages([]);
      setFilteredPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = pages.filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          page.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort by menu order, then by title
    filtered.sort((a, b) => {
      if (a.menuOrder !== b.menuOrder) {
        return a.menuOrder - b.menuOrder;
      }
      return a.title.localeCompare(b.title);
    });

    setFilteredPages(filtered);
  }, [pages, searchTerm, statusFilter]);

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      await pagesAPI.deletePage(pageId);
      setPages(pages.filter(p => p.id !== pageId));
      showToast.success('Page deleted successfully');
    } catch (error) {
      console.error('Failed to delete page:', error);
      showToast.error('Failed to delete page');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'full-width': return Layout;
      case 'minimal': return FileText;
      case 'landing': return Sparkles;
      case 'contact': return Users;
      case 'about': return User;
      default: return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Pages</h1>
          <p className="text-[var(--secondary)] mt-1">
            Manage your website pages and content
          </p>
        </div>

        {permissions.canCreate && (
          <Link href="/dashboard/pages/new">
            <Button icon={Plus}>
              New Page
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Pages', value: pages.length, icon: FileText },
          { label: 'Published', value: pages.filter(p => p.status === 'published').length, icon: Globe },
          { label: 'In Menu', value: pages.filter(p => p.showInMenu).length, icon: Layout },
          { label: 'Total Views', value: pages.reduce((sum, p) => sum + p.views, 0).toLocaleString(), icon: Eye }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                  <Icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--secondary)]">{stat.label}</p>
                  <p className="text-lg font-semibold text-[var(--foreground)]">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Pages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} padding="lg">
              <LoadingSkeleton lines={3} />
            </Card>
          ))
        ) : filteredPages.length > 0 ? (
          filteredPages.map((page, index) => {
            const TemplateIcon = getTemplateIcon(page.template);
            
            return (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover padding="lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-[var(--surface)] text-[var(--primary)]`}>
                      <TemplateIcon size={24} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[var(--foreground)] line-clamp-1">
                              {page.title}
                            </h3>
                            {page.isHomePage && (
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                                Homepage
                              </span>
                            )}
                            {page.showInMenu && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Menu
                              </span>
                            )}
                          </div>
                          <p className="text-[var(--secondary)] text-sm">
                            /{page.slug}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusBadge(page.status)}
                          
                          {permissions.canEdit && (
                            <div className="flex items-center gap-1">
                              <Link href={`/dashboard/pages/${page.id}/edit`}>
                                <Button variant="ghost" size="sm" icon={Edit} />
                              </Link>
                              {permissions.canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Trash2}
                                  onClick={() => handleDeletePage(page.id)}
                                />
                              )}
                              <Button variant="ghost" size="sm" icon={MoreVertical} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[var(--secondary)]">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          {page.author.firstName && page.author.lastName
                            ? `${page.author.firstName} ${page.author.lastName}`
                            : page.author.username}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {page.status === 'published' && page.publishedAt
                            ? `Published ${formatDate(page.publishedAt)}`
                            : `Updated ${formatDate(page.updatedAt)}`
                          }
                        </div>
                        
                        {page.status === 'published' && (
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            {page.views.toLocaleString()} views
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Layout size={14} />
                          {page.template.charAt(0).toUpperCase() + page.template.slice(1)} template
                        </div>
                        
                        {page.showInMenu && (
                          <div className="flex items-center gap-1">
                            <span>Order: {page.menuOrder}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <Card padding="xl">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-[var(--secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                No pages found
              </h3>
              <p className="text-[var(--secondary)] mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating your first page.'
                }
              </p>
              {permissions.canCreate && !searchTerm && statusFilter === 'all' && (
                <Link href="/dashboard/pages/new">
                  <Button icon={Plus}>
                    Create Your First Page
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </motion.div>

      {/* Menu Order Notice */}
      {filteredPages.some(page => page.showInMenu) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card padding="lg" className="border-blue-200 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Layout className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Menu Organization
                </h4>
                <p className="text-sm text-blue-700">
                  Pages with "Menu" label will appear in your site navigation. 
                  The order number determines their position in the menu.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}