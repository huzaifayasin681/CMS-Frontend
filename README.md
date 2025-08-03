# CMS System Frontend

A modern, responsive Content Management System frontend built with Next.js, React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🎨 **Modern User Interface**
- **Responsive Design** - Mobile-first approach with seamless desktop experience
- **Dark/Light Theme** - System preference detection with manual toggle
- **Rich Text Editor** - WYSIWYG editor with formatting, paste handling, and auto-save
- **Drag & Drop** - File uploads with progress indicators
- **Interactive Components** - Modals, tooltips, notifications, and animations
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation

### 📝 **Content Management**
- **Post Management** - Create, edit, delete blog posts with rich content
- **Page Builder** - Multiple page templates with visual builder support
- **Media Library** - Upload, organize, and manage images and files
- **Auto-Save** - Automatic draft saving with content history
- **SEO Optimization** - Meta tags, structured data, and URL optimization
- **Content Scheduling** - Publish posts at specific times

### 👥 **User Experience**
- **Authentication** - Secure login/register with email verification
- **User Profiles** - Avatar uploads, bio, and profile management
- **Comment System** - Nested comments with likes and real-time updates
- **Social Features** - Like posts, bookmark content, share articles
- **Search & Filter** - Advanced content discovery and filtering
- **Pagination** - Efficient content browsing with infinite scroll options

### 🛡️ **Security & Performance**
- **Role-Based Access** - Admin, Editor, and User permission levels
- **Rate Limiting** - Client-side request throttling
- **Input Validation** - Real-time form validation with error handling
- **Image Optimization** - Next.js Image component with lazy loading
- **Code Splitting** - Automatic route-based code splitting
- **Caching** - API response caching with intelligent invalidation

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Development**: ESLint, Prettier, Husky

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd cms-system/CMS-Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the frontend root:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_UPLOAD_URL=http://localhost:5000/uploads

# Features
NEXT_PUBLIC_ENABLE_COMMENTS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=false

# Third-party Services (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

4. **Start the development server**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🗂 Project Structure

```
CMS-Frontend/
├── public/
│   ├── icons/                   # App icons and favicons
│   ├── images/                  # Static images
│   └── manifest.json            # PWA manifest
├── src/
│   ├── app/                     # Next.js 14 App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── blog/                # Public blog pages
│   │   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── dashboard/           # Admin dashboard
│   │   │   ├── posts/
│   │   │   ├── pages/
│   │   │   ├── media/
│   │   │   ├── users/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   ├── loading.tsx          # Loading UI
│   │   ├── error.tsx            # Error boundaries
│   │   └── page.tsx             # Homepage
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── RichTextEditor.tsx
│   │   ├── forms/               # Form components
│   │   │   ├── PostForm.tsx
│   │   │   ├── PageForm.tsx
│   │   │   └── UserForm.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── blog/                # Blog-specific components
│   │   │   ├── PostCard.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   └── BlogSidebar.tsx
│   │   └── dashboard/           # Dashboard components
│   │       ├── DashboardStats.tsx
│   │       ├── RecentActivity.tsx
│   │       └── QuickActions.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useAutoSave.ts       # Auto-save functionality
│   │   ├── useLocalStorage.ts   # Local storage management
│   │   ├── useDebounce.ts       # Debounced values
│   │   └── usePermissions.ts    # Permission checking
│   ├── lib/                     # Utility libraries
│   │   ├── api.ts               # API client configuration
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── utils.ts             # General utilities
│   │   ├── validations.ts       # Form validation schemas
│   │   └── constants.ts         # App constants
│   ├── styles/                  # Additional styles
│   │   ├── components.css       # Component-specific styles
│   │   └── utilities.css        # Utility classes
│   └── types/                   # TypeScript type definitions
│       ├── auth.ts
│       ├── api.ts
│       ├── content.ts
│       └── global.ts
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Component Library

### Base UI Components

#### **Button**
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" icon={Plus} loading={isLoading}>
  Create Post
</Button>
```

**Props:**
- `variant`: primary | secondary | outline | ghost | danger
- `size`: sm | md | lg
- `icon`: Lucide icon component
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean

#### **Input**
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  required
/>
```

**Props:**
- `label`: string
- `type`: text | email | password | number | tel | url
- `placeholder`: string
- `error`: string
- `required`: boolean
- `disabled`: boolean

#### **Card**
```tsx
import { Card } from '@/components/ui/Card';

<Card padding="lg" hover shadow="md">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `padding`: sm | md | lg | xl
- `hover`: boolean
- `shadow`: sm | md | lg | xl
- `rounded`: sm | md | lg | xl

#### **Modal**
```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to delete this post?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="danger">Delete</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</Modal>
```

#### **Rich Text Editor**
```tsx
import { RichTextEditor } from '@/components/ui/RichTextEditor';

<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Start writing..."
  toolbar={['bold', 'italic', 'link', 'list']}
  editable={true}
/>
```

**Features:**
- **Formatting**: Bold, italic, underline, strikethrough
- **Lists**: Ordered and unordered lists
- **Links**: Insert and edit links
- **Images**: Drag & drop image insertion
- **Paste Handling**: Clean paste from Word/Google Docs
- **Auto-Save**: Automatic content saving
- **Undo/Redo**: Full history management

#### **Toast Notifications**
```tsx
import { showToast } from '@/components/ui/Toast';

// Success notification
showToast.success('Post published successfully!');

// Error notification
showToast.error('Failed to save post');

// Info notification
showToast.info('Draft auto-saved');

// Warning notification
showToast.warning('You have unsaved changes');
```

## 🔐 Authentication System

### Auth Store (Zustand)
```tsx
import { useAuthStore } from '@/lib/auth';

function Component() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    updateProfile 
  } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
      ) : (
        <Button onClick={() => router.push('/login')}>
          Sign In
        </Button>
      )}
    </div>
  );
}
```

### Protected Routes
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Permission Hook
```tsx
import { usePermissions } from '@/hooks/usePermissions';

function PostActions({ post }) {
  const { canEdit, canDelete } = usePermissions();

  return (
    <div>
      {canEdit(post) && <Button>Edit</Button>}
      {canDelete(post) && <Button variant="danger">Delete</Button>}
    </div>
  );
}
```

## 📝 Forms & Validation

### Form Components

#### **Post Form**
```tsx
import { PostForm } from '@/components/forms/PostForm';

<PostForm
  postId={postId} // Optional for editing
  onSave={(post) => console.log('Post saved:', post)}
  onCancel={() => router.back()}
/>
```

**Features:**
- Rich text content editing
- Featured image upload
- SEO fields (title, description)
- Category and tag management
- Auto-save functionality
- Draft/publish status
- Content preview

#### **Page Form**
```tsx
import { PageForm } from '@/components/forms/PageForm';

<PageForm
  pageId={pageId}
  onSave={(page) => console.log('Page saved:', page)}
/>
```

**Features:**
- Multiple page templates
- Menu visibility settings
- Parent page selection
- Custom CSS/JS
- Homepage designation
- Template-specific fields

### Auto-Save Hook
```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

const { isAutoSaving, lastSaved } = useAutoSave({
  data: formData,
  onSave: async (data) => {
    await api.savePost(data);
  },
  delay: 3000,
  enabled: true
});
```

## 🎯 Dashboard Features

### Dashboard Overview
- **Statistics Cards**: Posts, pages, users, comments count
- **Recent Activity**: Latest user actions and content changes
- **Quick Actions**: Create post, upload media, manage users
- **Analytics Charts**: Traffic, engagement, and performance metrics

### Post Management
- **Post List**: Sortable table with filters and search
- **Post Editor**: Rich text editor with live preview
- **Media Integration**: Drag & drop image insertion
- **SEO Tools**: Meta tags, slug optimization, preview

### Page Management
- **Page Builder**: Multiple templates with visual builder
- **Menu Management**: Hierarchical page organization
- **Template System**: Default, full-width, minimal, landing pages

### Media Library
- **File Upload**: Drag & drop with progress indicators
- **File Organization**: Folder structure and tagging
- **Image Editing**: Basic crop, resize, and optimization
- **Bulk Operations**: Select and delete multiple files

### User Management (Admin)
- **User List**: Role-based filtering and management
- **User Profiles**: Edit user information and permissions
- **Role Assignment**: Admin, Editor, User roles
- **Activity Monitoring**: User action tracking

### Analytics Dashboard
- **Traffic Analytics**: Page views, unique visitors, bounce rate
- **Content Performance**: Popular posts, engagement metrics
- **User Analytics**: Registration trends, active users
- **Export Options**: CSV, PDF reports

## 🎨 Theming & Customization

### CSS Variables
```css
:root {
  /* Primary Colors */
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  
  /* Background Colors */
  --background: #ffffff;
  --foreground: #0f172a;
  --surface: #f8fafc;
  
  /* Border Colors */
  --border: #e2e8f0;
  --ring: #3b82f6;
  
  /* Text Colors */
  --secondary: #64748b;
  --muted: #94a3b8;
}

[data-theme="dark"] {
  --background: #0f172a;
  --foreground: #f8fafc;
  --surface: #1e293b;
  --border: #334155;
  --secondary: #94a3b8;
}
```

### Theme Toggle
```tsx
import { useTheme } from '@/hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      icon={theme === 'dark' ? Sun : Moon}
    >
      {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </Button>
  );
}
```

## 🔌 API Integration

### API Client
```tsx
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

### API Hooks
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch posts
export function usePosts(params = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => postsAPI.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create post mutation
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postsAPI.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      showToast.success('Post created successfully!');
    },
    onError: (error) => {
      showToast.error('Failed to create post');
    },
  });
}
```

### Enhanced APIs with Caching
```tsx
// Automatic cache invalidation
export const postsAPI = createEnhancedAPI({
  getPosts: (params) => api.get('/posts', { params }),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
}, {
  createPost: ['/posts'], // Invalidate posts cache
  updatePost: ['/posts'],
  deletePost: ['/posts'],
});
```

## 🚀 Performance Optimizations

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/featured-image.jpg"
  alt="Featured post image"
  width={800}
  height={400}
  className="rounded-lg"
  placeholder="blur"
  priority // Above the fold images
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor'),
  { 
    ssr: false,
    loading: () => <div>Loading editor...</div>
  }
);
```

### Infinite Scroll
```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => 
      postsAPI.getPosts({ page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
  });

  return (
    <div>
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
      
      {hasNextPage && (
        <Button 
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
        >
          Load More
        </Button>
      )}
    </div>
  );
}
```

## 📱 Responsive Design

### Breakpoint System
```css
/* Tailwind CSS Breakpoints */
sm: '640px'   /* Small devices */
md: '768px'   /* Medium devices */
lg: '1024px'  /* Large devices */
xl: '1280px'  /* Extra large devices */
2xl: '1536px' /* 2X large devices */
```

### Responsive Components
```tsx
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  gap-4
">
  {posts.map(post => (
    <PostCard key={post.id} post={post} />
  ))}
</div>
```

### Mobile Navigation
```tsx
function MobileNav() {
  return (
    <nav className="md:hidden">
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          <NavItem icon={Home} label="Home" />
          <NavItem icon={Search} label="Search" />
          <NavItem icon={Plus} label="Create" />
          <NavItem icon={User} label="Profile" />
        </div>
      </div>
    </nav>
  );
}
```

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab Navigation**: Logical tab order through all interactive elements
- **Escape Key**: Close modals and dropdowns
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate through menus and lists

### Screen Reader Support
```tsx
<button
  aria-label="Like this post"
  aria-pressed={isLiked}
  onClick={handleLike}
>
  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
  <span className="sr-only">
    {isLiked ? 'Unlike' : 'Like'} this post
  </span>
</button>
```

### Focus Management
```tsx
import { useRef, useEffect } from 'react';

function Modal({ isOpen }) {
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div role="dialog" aria-modal="true">
      <button ref={firstFocusableRef}>Close</button>
    </div>
  );
}
```

## 🧪 Testing

### Unit Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Component Testing
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

test('Button renders and handles click', () => {
  const handleClick = jest.fn();
  
  render(
    <Button onClick={handleClick}>
      Click me
    </Button>
  );

  const button = screen.getByRole('button', { name: /click me/i });
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### E2E Testing
```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('test@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## 🔧 Development Tools

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Husky Git Hooks
```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test
```

## 🚀 Deployment

### Build Process
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
```env
# Production environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Docker Support
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deployment
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

## 📊 Analytics & Monitoring

### Google Analytics
```tsx
// lib/analytics.ts
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Usage
trackEvent('post_like', 'engagement', post.title);
```

### Error Monitoring
```tsx
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export const captureError = (error: Error, context?: any) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error:', error, context);
  }
};
```

## 🔧 Troubleshooting

### Common Issues

#### **Hydration Errors**
```tsx
// Use dynamic imports for client-only components
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);
```

#### **Authentication Issues**
```tsx
// Check token expiration
const isTokenValid = () => {
  const token = localStorage.getItem('auth-token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
```

#### **API Connection Issues**
```tsx
// Retry mechanism for failed requests
const retryRequest = async (fn: Function, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes
6. Add tests for new features
7. Ensure all tests pass: `npm test`
8. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Write meaningful component and function names
- Add JSDoc comments for complex functions
- Use semantic HTML elements
- Ensure accessibility compliance
- Write tests for new components

### Commit Convention
```bash
feat: add new blog post template
fix: resolve comment loading issue
docs: update API documentation
style: improve button hover effects
refactor: simplify authentication logic
test: add unit tests for PostCard component
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions

---

*Built with ❤️ using Next.js, TypeScript, and modern web technologies.*