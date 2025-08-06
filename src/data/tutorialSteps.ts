'use client';

import { TutorialStep } from '@/contexts/TutorialContext';

// Dashboard overview tutorial steps
export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CMS Dashboard',
    content: 'Welcome to your content management system! This tutorial will guide you through the main features and help you get started.',
    position: 'center'
  },
  {
    id: 'sidebar-navigation',
    title: 'Navigation Sidebar',
    content: 'Use the sidebar to navigate between different sections like Posts, Pages, Media, and User Management.',
    target: '[data-tutorial="sidebar"]',
    position: 'right'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    content: 'Stay informed with real-time notifications about content updates, user activities, and system messages.',
    target: '[data-tutorial="notifications"]',
    position: 'bottom'
  },
  {
    id: 'user-menu',
    title: 'User Menu',
    content: 'Access your profile settings, preferences, and logout option from the user menu.',
    target: '[data-tutorial="user-menu"]',
    position: 'left'
  },
  {
    id: 'main-content',
    title: 'Main Content Area',
    content: 'This is where you\'ll manage your content. Different sections will show different tools and options.',
    target: '[data-tutorial="main-content"]',
    position: 'center'
  }
];

// Posts tutorial steps
export const postsTutorialSteps: TutorialStep[] = [
  {
    id: 'posts-overview',
    title: 'Posts Management',
    content: 'Here you can create, edit, and manage all your blog posts and articles.',
    target: '[data-tutorial="posts-header"]',
    position: 'bottom'
  },
  {
    id: 'create-post',
    title: 'Create New Post',
    content: 'Click here to create a new blog post or article.',
    target: '[data-tutorial="create-post-btn"]',
    position: 'bottom',
    action: {
      text: 'Try Creating a Post',
      onClick: () => {
        const btn = document.querySelector('[data-tutorial="create-post-btn"]') as HTMLElement;
        btn?.click();
      }
    }
  },
  {
    id: 'posts-filters',
    title: 'Filter and Search',
    content: 'Use these filters to find specific posts by status, author, or search terms.',
    target: '[data-tutorial="posts-filters"]',
    position: 'bottom'
  },
  {
    id: 'posts-list',
    title: 'Posts List',
    content: 'View all your posts here. You can edit, delete, or change the status of each post.',
    target: '[data-tutorial="posts-list"]',
    position: 'top'
  }
];

// Pages tutorial steps
export const pagesTutorialSteps: TutorialStep[] = [
  {
    id: 'pages-overview',
    title: 'Pages Management',
    content: 'Manage static pages like About Us, Contact, Terms of Service, and custom landing pages.',
    target: '[data-tutorial="pages-header"]',
    position: 'bottom'
  },
  {
    id: 'create-page',
    title: 'Create New Page',
    content: 'Create new static pages for your website.',
    target: '[data-tutorial="create-page-btn"]',
    position: 'bottom'
  },
  {
    id: 'homepage-setting',
    title: 'Homepage Settings',
    content: 'You can set any page as your website\'s homepage from the page settings.',
    target: '[data-tutorial="pages-list"]',
    position: 'top'
  }
];

// Media tutorial steps
export const mediaTutorialSteps: TutorialStep[] = [
  {
    id: 'media-overview',
    title: 'Media Library',
    content: 'Upload and manage images, videos, documents, and other media files for your content.',
    target: '[data-tutorial="media-header"]',
    position: 'bottom'
  },
  {
    id: 'upload-media',
    title: 'Upload Files',
    content: 'Drag and drop files here or click to browse and upload new media.',
    target: '[data-tutorial="upload-area"]',
    position: 'bottom'
  },
  {
    id: 'media-grid',
    title: 'Media Grid',
    content: 'Browse your uploaded files in a visual grid. Click on any file to view details or copy links.',
    target: '[data-tutorial="media-grid"]',
    position: 'top'
  }
];

// Users tutorial steps (for admins)
export const usersTutorialSteps: TutorialStep[] = [
  {
    id: 'users-overview',
    title: 'User Management',
    content: 'Manage user accounts, roles, and permissions for your CMS system.',
    target: '[data-tutorial="users-header"]',
    position: 'bottom'
  },
  {
    id: 'invite-user',
    title: 'Invite New Users',
    content: 'Send invitations to new users to join your CMS with specific roles.',
    target: '[data-tutorial="invite-user-btn"]',
    position: 'bottom'
  },
  {
    id: 'user-roles',
    title: 'User Roles',
    content: 'Different roles have different permissions: Viewer (read-only), Editor (create/edit content), Admin (full access).',
    target: '[data-tutorial="users-list"]',
    position: 'top'
  },
  {
    id: 'pending-approvals',
    title: 'Pending Approvals',
    content: 'Review and approve new user registrations that require admin approval.',
    target: '[data-tutorial="pending-tab"]',
    position: 'bottom'
  }
];

// Role-specific tutorial steps
export const getTutorialStepsForRole = (role: string, section?: string): TutorialStep[] => {
  const baseSteps = [...dashboardTutorialSteps];
  
  if (section === 'posts') {
    return postsTutorialSteps;
  }
  
  if (section === 'pages') {
    return pagesTutorialSteps;
  }
  
  if (section === 'media') {
    return mediaTutorialSteps;
  }
  
  if (section === 'users' && ['admin', 'superadmin'].includes(role)) {
    return usersTutorialSteps;
  }
  
  // Return role-specific dashboard overview
  switch (role) {
    case 'viewer':
      return baseSteps.filter(step => 
        !['user-menu'].includes(step.id) // Viewers have limited menu options
      ).concat([
        {
          id: 'viewer-limitations',
          title: 'Viewer Role',
          content: 'As a viewer, you can browse and read content but cannot create or edit posts and pages.',
          position: 'center'
        }
      ]);
    
    case 'editor':
      return baseSteps.concat([
        {
          id: 'content-creation',
          title: 'Content Creation',
          content: 'As an editor, you can create and edit posts and pages. Your content may require approval before publishing.',
          target: '[data-tutorial="sidebar"]',
          position: 'right'
        }
      ]);
    
    case 'admin':
    case 'superadmin':
      return baseSteps.concat([
        {
          id: 'admin-features',
          title: 'Admin Features',
          content: 'As an admin, you have access to user management, system settings, and can approve/publish all content.',
          target: '[data-tutorial="sidebar"]',
          position: 'right'
        },
        {
          id: 'user-management',
          title: 'User Management',
          content: 'You can invite new users, manage roles, and handle user approvals from the Users section.',
          target: '[data-tutorial="sidebar"]',
          position: 'right'
        }
      ]);
    
    default:
      return baseSteps;
  }
};

// Tutorial completion tracking
export const TUTORIAL_SECTIONS = [
  'dashboard',
  'posts', 
  'pages',
  'media',
  'users'
] as const;

export type TutorialSection = typeof TUTORIAL_SECTIONS[number];

// Check if user should see tutorial for a specific section
export const shouldShowSectionTutorial = (
  section: TutorialSection, 
  userId: string,
  userRole: string
): boolean => {
  // Users section is only for admins
  if (section === 'users' && !['admin', 'superadmin'].includes(userRole)) {
    return false;
  }
  
  const key = `tutorial_${section}_completed_${userId}`;
  return !localStorage.getItem(key);
};

// Mark section tutorial as completed
export const markSectionTutorialCompleted = (
  section: TutorialSection,
  userId: string
): void => {
  const key = `tutorial_${section}_completed_${userId}`;
  localStorage.setItem(key, 'completed');
};

// Reset all tutorials for user (for testing or user preference)
export const resetAllTutorials = (userId: string): void => {
  TUTORIAL_SECTIONS.forEach(section => {
    const key = `tutorial_${section}_completed_${userId}`;
    localStorage.removeItem(key);
  });
  
  // Also reset main dashboard tutorial
  const mainKey = `tutorial_completed_${userId}`;
  localStorage.removeItem(mainKey);
};