# CMS System Frontend

A modern, responsive, and feature-rich content management system frontend built with Next.js, React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 15.4.2 (App Router)
- **Library**: React 19.1.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + Custom CSS Variables
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Authentication**: JWT with HTTP-only cookies (js-cookie)
- **Rich Text Editor**: TipTap
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **UI Components**: Headless UI

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Admin Dashboard
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── posts/          # Blog posts management
│   │   │   ├── pages/          # Static pages management
│   │   │   ├── media/          # Media library
│   │   │   ├── profile/        # User profile
│   │   │   ├── analytics/      # Analytics dashboard
│   │   │   └── settings/       # System settings
│   │   ├── blog/               # Public blog
│   │   │   ├── page.tsx        # Blog listing
│   │   │   └── [slug]/         # Individual blog posts
│   │   ├── pages/              # Public static pages
│   │   │   └── [slug]/         # Dynamic page routing
│   │   ├── login/              # Authentication
│   │   ├── register/           # User registration
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage (dual mode)
│   │   ├── providers.tsx       # Global providers
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx      # Universal header
│   │   │   ├── DashboardSidebar.tsx # Admin sidebar
│   │   │   ├── ProtectedRoute.tsx   # Route protection
│   │   │   └── PublicNav.tsx   # Public navigation
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.tsx # CMS product landing
│   │   │   └── PublicHomePage.tsx # Public content home
│   │   └── ui/                 # Reusable UI components
│   │       ├── Button.tsx      # Button component
│   │       ├── Card.tsx        # Card component
│   │       ├── Input.tsx       # Input component
│   │       ├── LoadingSpinner.tsx # Loading states
│   │       └── Toast.tsx       # Notification system
│   └── lib/                    # Utilities and configuration
│       ├── api.ts              # API client & endpoints
│       ├── auth.ts             # Authentication store
│       └── theme.ts            # Theme management
├── public/                     # Static assets
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Key Features

### Dual-Purpose Frontend
- **Public Website**: Content-focused homepage, blog, and static pages
- **CMS Landing**: Product marketing page for the CMS itself
- **Smart Routing**: Automatic detection based on context

### Authentication & Authorization
- **JWT-based authentication** with secure cookie storage
- **Role-based access control** (Admin, Editor, Viewer)
- **Protected routes** with automatic redirects
- **Permission-based UI** components
- **Registration with role selection**

### Content Management Dashboard
- **Modern dashboard** with statistics and analytics
- **Blog post management** with rich text editor
- **Static page creation** and management
- **Media library** with upload capabilities
- **User profile management**
- **Real-time content preview**

### Public Content Display
- **Blog listing** with search, filtering, and pagination
- **Individual blog posts** with social sharing
- **Static pages** with template support
- **SEO optimization** with meta tags
- **Responsive design** for all devices

### User Experience
- **Theme switching** (Light, Dark, Colorful)
- **Smooth animations** with Framer Motion
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Mobile-responsive** navigation

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Backend API running on port 5000

### Installation
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure environment variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Access Points
```bash
# Public Homepage
http://localhost:3000/

# CMS Product Landing
http://localhost:3000/?cms=true

# Blog
http://localhost:3000/blog

# Authentication
http://localhost:3000/login
http://localhost:3000/register

# Dashboard (requires login)
http://localhost:3000/dashboard
```

## 🔐 Authentication Flow

### Demo Credentials
```
Admin:  admin@demo.com / admin123
Editor: editor@demo.com / editor123
Viewer: viewer@demo.com / viewer123
```

### Registration Process
- Username (min 3 characters)
- Email (valid format)
- Password (min 6 chars, complexity rules)
- Role selection (Admin, Editor, Viewer)

### Protected Routes
- Automatic authentication check
- Role-based permission verification
- Loading states during verification
- Automatic redirects for unauthorized users

## 📄 Page Structure

### Public Pages
- **Homepage**: Dual mode (public content or CMS landing)
- **Blog**: Listing with search/filter + individual posts
- **Static Pages**: About, Contact, Privacy Policy

### Dashboard Pages
- **Dashboard Home**: Statistics and activity overview
- **Posts**: Blog post management with rich editor
- **Pages**: Static page creation and management
- **Media**: File upload and media library
- **Profile**: User profile management
- **Analytics**: Content performance metrics
- **Settings**: System configuration

## 🎨 Design System

### Theme Architecture
- **CSS Custom Properties** for theming
- **Three themes**: Light, Dark, Colorful
- **Dynamic theme switching**
- **Consistent color system**

### Component Library
- **Button**: Multiple variants and sizes
- **Card**: Hover effects and glassmorphism
- **Input**: Labels, hints, and error states
- **LoadingSpinner**: Various loading states
- **Toast**: Success, error, and info notifications

## 🔌 API Integration

### Authentication Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  register: (userData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

### Permission System
```typescript
export const usePermissions = () => ({
  isAdmin: user?.role === 'admin',
  isEditor: user?.role === 'editor' || user?.role === 'admin',
  canCreate: user?.role === 'editor' || user?.role === 'admin',
  canEdit: user?.role === 'editor' || user?.role === 'admin',
  canDelete: user?.role === 'admin',
});
```

### API Endpoints
- **Authentication**: Login, register, profile management
- **Posts**: CRUD operations for blog posts
- **Pages**: CRUD operations for static pages
- **Media**: File upload and management

## 📱 Responsive Design

### Mobile-First Approach
- Touch-friendly interface elements
- Adaptive layouts for different screen sizes
- Mobile navigation with hamburger menu
- Optimized for tablet and desktop

### Cross-Browser Compatibility
- Modern browser support (Chrome, Firefox, Safari, Edge)
- Fallbacks for older browsers
- Progressive enhancement

## 🎯 User Experience Features

### Loading States
- Skeleton loaders for content sections
- Spinner components for actions
- Progressive loading for large datasets

### Error Handling
- Toast notifications for user feedback
- Error boundaries for component crashes
- Graceful degradation for offline scenarios

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- Semantic HTML structure
- Color contrast compliance

## 🚦 Performance Optimization

### Next.js Features
- App Router for optimal performance
- Code splitting by routes and components
- Image optimization with Next.js Image
- Static site generation where applicable

### Bundle Optimization
- Tree shaking for unused code elimination
- Dynamic imports for heavy dependencies
- Compression with gzip/brotli

## 🔒 Security Features

### Client-Side Security
- XSS protection with proper sanitization
- CSRF protection with SameSite cookies
- Secure authentication token handling
- Input validation with real-time feedback

---

*This frontend provides a modern, scalable, and user-friendly interface for the CMS system with enterprise-grade features and performance.*
