'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown, Home, FileText, Users, Phone, LucideIcon } from 'lucide-react';
import { pagesAPI } from '@/lib/api';

interface NavPage {
  id: string;
  title: string;
  slug: string;
  showInMenu: boolean;
  menuOrder: number;
}

interface PublicNavProps {
  className?: string;
}

export const PublicNav: React.FC<PublicNavProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pages, setPages] = useState<NavPage[]>([]);

  useEffect(() => {
    fetchMenuPages();
  }, []);

  const fetchMenuPages = async () => {
    try {
      // Try to get menu pages first, fallback to all pages
      try {
        console.log('🔍 Calling getMenuPages API...');
        const response = await pagesAPI.getMenuPages();
        console.log('📡 Menu pages API response:', response);
        console.log('📄 Full response data:', JSON.stringify(response.data, null, 2));
        const pagesData = response.data.data?.pages || response.data.pages || response.data;
        console.log('📦 Extracted pages data:', pagesData);
        if (pagesData && pagesData.length > 0) {
          console.log('🔎 First page complete details:', JSON.stringify(pagesData[0], null, 2));
        }
        if (Array.isArray(pagesData)) {
          // Transform _id to id for consistency and fix showInMenu undefined issue
          const transformedPages = pagesData.map((page: any) => ({
            ...page,
            id: page._id || page.id,
            // TEMPORARY FIX: If showInMenu is undefined, assume true for published pages
            showInMenu: page.showInMenu !== undefined ? page.showInMenu : true
          }));
          console.log('Transformed pages for menu (with showInMenu fix):', transformedPages);
          setPages(transformedPages);
          return;
        }
      } catch (menuError) {
        console.log('❌ Menu pages API failed, trying fallback:', menuError);
        // Fallback to getting all published pages
        console.log('🔄 Calling fallback getPages API...');
        const allPagesResponse = await pagesAPI.getPages({ status: 'published' });
        console.log('📡 Fallback API response:', allPagesResponse);
        const allPages = allPagesResponse.data.pages || [];
        const menuPages = allPages
          .map((page: any) => ({
            ...page,
            id: page._id || page.id,
            // TEMPORARY FIX: If showInMenu is undefined, assume true for published pages
            showInMenu: page.showInMenu !== undefined ? page.showInMenu : true
          }))
          .filter((page: any) => page.showInMenu === true)
          .sort((a: any, b: any) => (a.menuOrder || 0) - (b.menuOrder || 0));
        console.log('Filtered menu pages:', menuPages);
        setPages(menuPages);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch menu pages:', error);
      // Set empty array if all API calls fail
      setPages([]);
    }
  };

  const mainNavItems: Array<{title: string, href: string, icon: LucideIcon, isActive: boolean}> = [
    { 
      title: 'Home', 
      href: '/', 
      icon: Home,
      isActive: pathname === '/'
    },
    { 
      title: 'Blog', 
      href: '/blog', 
      icon: FileText,
      isActive: pathname.startsWith('/blog')
    }
  ];

  const pageNavItems: Array<{title: string, href: string, isActive: boolean}> = (Array.isArray(pages) ? pages : [])
    .filter((page: any) => {
      console.log('Checking page for menu:', page.title, 'showInMenu:', page.showInMenu);
      return page.showInMenu === true;
    })
    .sort((a: any, b: any) => (a.menuOrder || 0) - (b.menuOrder || 0))
    .map((page: any) => ({
      title: page.title,
      href: `/pages/${page.slug}`,
      isActive: pathname === `/pages/${page.slug}`
    }));

  console.log('Final pageNavItems:', pageNavItems);

  const allNavItems = [...mainNavItems, ...pageNavItems];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {allNavItems.map((item) => {
          const Icon = 'icon' in item ? item.icon as LucideIcon : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.isActive
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                  : 'text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)]'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.title}
            </Link>
          );
        })}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-full left-0 right-0 bg-[var(--background)] border-t border-[var(--border)] shadow-lg z-50"
        >
          <div className="px-4 py-4 space-y-2">
            {allNavItems.map((item) => {
              const Icon = 'icon' in item ? item.icon as LucideIcon : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.isActive
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                      : 'text-[var(--secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.title}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </nav>
  );
};