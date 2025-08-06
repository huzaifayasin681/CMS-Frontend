import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Cache
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  generateKey(config: AxiosRequestConfig): string {
    return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`;
  }
}

const apiCache = new APICache();

// Retry logic helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) return true; // Network error
  if (error.response.status >= 500) return true; // Server error
  if (error.response.status === 429) return true; // Rate limit
  if (error.code === 'ECONNABORTED') return true; // Timeout
  return false;
};

const retryRequest = async (
  requestFn: () => Promise<AxiosResponse>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<AxiosResponse> => {
  let lastError: AxiosError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as AxiosError;
      
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

// Create axios instance for authenticated requests
const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`, // Add versioning
  timeout: 15000, // Increased timeout
  withCredentials: true,
});

// Create axios instance for public requests (no auth required)
const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/v1`, // Add versioning
  timeout: 15000, // Increased timeout
  withCredentials: true,
});

// Enhanced request interceptor for authenticated API
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = apiCache.generateKey(config);
      const cachedResponse = apiCache.get(cacheKey);
      if (cachedResponse) {
        (config as any).metadata = { ...(config as any).metadata, cached: true, cacheKey };
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced request interceptor for public API
publicApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = apiCache.generateKey(config);
      const cachedResponse = apiCache.get(cacheKey);
      if (cachedResponse) {
        (config as any).metadata = { ...(config as any).metadata, cached: true, cacheKey };
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for authenticated API
api.interceptors.response.use(
  (response) => {
    // Cache GET responses for frequently accessed data
    if (response.config.method === 'get' && !(response.config as any).metadata?.cached) {
      const cacheKey = apiCache.generateKey(response.config);
      const cacheTTL = getCacheTTL(response.config.url || '');
      if (cacheTTL > 0) {
        apiCache.set(cacheKey, response, cacheTTL);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      Cookies.remove('cms_token');
      apiCache.clear(); // Clear cache on auth failure
      
      // Redirect to login for protected routes
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    // Retry logic for network errors and server errors
    if (shouldRetry(error) && !originalRequest._retryCount) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= 3) {
        const delay = 1000 * Math.pow(2, originalRequest._retryCount - 1);
        await sleep(delay);
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for public API
publicApi.interceptors.response.use(
  (response) => {
    // Cache GET responses for frequently accessed data
    if (response.config.method === 'get' && !(response.config as any).metadata?.cached) {
      const cacheKey = apiCache.generateKey(response.config);
      const cacheTTL = getCacheTTL(response.config.url || '');
      if (cacheTTL > 0) {
        apiCache.set(cacheKey, response, cacheTTL);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401) {
      // Clear token if unauthorized but don't redirect
      Cookies.remove('cms_token');
    }
    
    // Retry logic for network errors and server errors
    if (shouldRetry(error) && !originalRequest._retryCount) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= 3) {
        const delay = 1000 * Math.pow(2, originalRequest._retryCount - 1);
        await sleep(delay);
        return publicApi(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// Cache TTL configuration based on endpoint
const getCacheTTL = (url: string): number => {
  if (url.includes('/settings')) return 600000; // 10 minutes
  if (url.includes('/menu') || url.includes('/homepage')) return 300000; // 5 minutes
  if (url.includes('/posts') && url.includes('?')) return 120000; // 2 minutes for post lists
  if (url.includes('/pages') && url.includes('?')) return 120000; // 2 minutes for page lists
  if (url.includes('/media/stats')) return 300000; // 5 minutes
  if (url.includes('/analytics')) return 180000; // 3 minutes
  return 0; // No cache by default
};

// Auth API endpoints
export const authAPI = {
  register: (data: any) => publicApi.post('/auth/register', data),
  adminRegister: (data: any) => api.post('/auth/admin-register', data),
  login: (data: any) => publicApi.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/password', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Email verification endpoints
  verifyEmail: (token: string) => publicApi.get(`/auth/verify-email?token=${token}`),
  resendVerification: (data: { email: string }) => publicApi.post('/auth/resend-verification', data),
  forgotPassword: (data: { email: string }) => publicApi.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) => publicApi.post('/auth/reset-password', data),
  // Admin approval endpoints
  getPendingUsers: () => api.get('/auth/pending-users'),
  approveUser: (userId: string) => api.post(`/auth/approve/${userId}`),
  rejectUser: (userId: string) => api.post(`/auth/reject/${userId}`),
  getAllUsers: (params?: any) => api.get('/auth/users', { params }),
};

// Posts API endpoints (enhanced version defined below)

// Pages API endpoints (enhanced version defined below)

// Media API endpoints (enhanced version defined below)

// Analytics API endpoints (enhanced version defined below)

// Activity API endpoints (enhanced version defined below)

// Settings API endpoints (enhanced version defined below)

// Cache management utilities
export const cacheUtils = {
  clear: () => apiCache.clear(),
  delete: (key: string) => apiCache.delete(key),
  invalidatePattern: (pattern: string) => {
    // Clear cache entries matching pattern
    const keys = Array.from((apiCache as any).cache.keys()) as string[];
    keys.forEach(key => {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    });
  },
  getCacheStats: () => ({
    size: (apiCache as any).cache.size,
    keys: Array.from((apiCache as any).cache.keys()) as string[]
  })
};

// Enhanced API methods with cache invalidation
const createEnhancedAPI = (baseAPI: any, cacheInvalidationRules: Record<string, string[]>) => {
  const enhanced = { ...baseAPI };
  
  Object.keys(cacheInvalidationRules).forEach(method => {
    const originalMethod = enhanced[method];
    if (originalMethod) {
      enhanced[method] = async (...args: any[]) => {
        const result = await originalMethod(...args);
        
        // Invalidate related cache entries
        cacheInvalidationRules[method].forEach(pattern => {
          cacheUtils.invalidatePattern(pattern);
        });
        
        return result;
      };
    }
  });
  
  return enhanced;
};

// Enhanced Posts API with cache invalidation
export const postsAPI = createEnhancedAPI({
  getPosts: (params?: any) => publicApi.get('/posts', { params }),
  getPost: (id: string) => publicApi.get(`/posts/${id}`),
  createPost: (data: any) => api.post('/posts', data),
  updatePost: (id: string, data: any) => api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
  savePostDraft: (id: string, data: any) => api.post(`/posts/${id}/save-draft`, data),
}, {
  createPost: ['/posts'],
  updatePost: ['/posts', '/analytics'],
  deletePost: ['/posts', '/analytics'],
  toggleLike: ['/posts', '/analytics'],
  savePostDraft: ['/posts']
});

// Enhanced Comments API with cache invalidation
export const commentsAPI = createEnhancedAPI({
  getComments: (postId: string, params?: any) => publicApi.get(`/comments/${postId}`, { params }),
  createComment: (postId: string, data: any) => api.post(`/comments/${postId}`, data),
  toggleCommentLike: (commentId: string) => api.post(`/comments/${commentId}/like`),
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
}, {
  createComment: ['/comments'],
  toggleCommentLike: ['/comments'],
  deleteComment: ['/comments']
});

// Enhanced Pages API with cache invalidation
export const pagesAPI = createEnhancedAPI({
  getPages: (params?: any) => publicApi.get('/pages', { params }),
  getPage: (id: string) => publicApi.get(`/pages/${id}`),
  createPage: (data: any) => api.post('/pages', data),
  updatePage: (id: string, data: any) => api.put(`/pages/${id}`, data),
  deletePage: (id: string) => api.delete(`/pages/${id}`),
  getMenuPages: () => publicApi.get('/pages/menu'),
  getHomePage: () => publicApi.get('/pages/homepage'),
}, {
  createPage: ['/pages', '/menu'],
  updatePage: ['/pages', '/menu', '/homepage'],
  deletePage: ['/pages', '/menu', '/homepage']
});

// Enhanced Media API with cache invalidation
export const mediaAPI = createEnhancedAPI({
  uploadMedia: (file: File, data?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.alt) formData.append('alt', data.alt);
    if (data?.caption) formData.append('caption', data.caption);
    if (data?.folder) formData.append('folder', data.folder);
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMedia: (params?: any) => api.get('/media', { params }),
  getMediaById: (id: string) => api.get(`/media/${id}`),
  updateMedia: (id: string, data: any) => api.put(`/media/${id}`, data),
  deleteMedia: (id: string) => api.delete(`/media/${id}`),
  bulkDeleteMedia: (mediaIds: string[]) => api.post('/media/bulk-delete', { mediaIds }),
  getMediaStats: () => api.get('/media/stats'),
}, {
  uploadMedia: ['/media', '/media/stats'],
  updateMedia: ['/media'],
  deleteMedia: ['/media', '/media/stats'],
  bulkDeleteMedia: ['/media', '/media/stats']
});

// Enhanced Analytics API (no cache invalidation needed as it's read-only)
export const analyticsAPI = {
  getDashboardOverview: (params?: any) => api.get('/analytics/overview', { params }),
  getContentPerformance: (params?: any) => api.get('/analytics/content', { params }),
  getTrafficAnalytics: (params?: any) => api.get('/analytics/traffic', { params }),
  getUserAnalytics: (params?: any) => api.get('/analytics/users', { params }),
  getMediaAnalytics: (params?: any) => api.get('/analytics/media', { params }),
  getSearchAnalytics: (params?: any) => api.get('/analytics/search', { params }),
  exportAnalytics: (params?: any) => api.get('/analytics/export', { params }),
};

// Enhanced Activity API (no cache invalidation needed as it's read-only)
export const activityAPI = {
  getRecentActivities: (params?: any) => api.get('/activity', { params }),
  getActivityStats: (params?: any) => api.get('/activity/stats', { params }),
};

// Enhanced User Management API (SuperAdmin only) with cache invalidation
export const userManagementAPI = createEnhancedAPI({
  getUserStats: () => api.get('/auth/users/stats'),
  getAllUsers: (params?: any) => api.get('/auth/users', { params }),
  getUserById: (userId: string) => api.get(`/auth/users/${userId}`),
  createUser: (userData: any) => api.post('/auth/users/create', userData),
  updateUser: (userId: string, userData: any) => api.put(`/auth/users/${userId}`, userData),
  deleteUser: (userId: string) => api.delete(`/auth/users/${userId}`),
  activateUser: (userId: string) => api.post(`/auth/users/${userId}/activate`),
  deactivateUser: (userId: string) => api.post(`/auth/users/${userId}/deactivate`),
  resetUserPassword: (userId: string, newPassword: string) => 
    api.post(`/auth/users/${userId}/reset-password`, { newPassword }),
}, {
  createUser: ['/auth/users', '/auth/users/stats'],
  updateUser: ['/auth/users', '/auth/users/stats'],
  deleteUser: ['/auth/users', '/auth/users/stats'],
  activateUser: ['/auth/users', '/auth/users/stats'],
  deactivateUser: ['/auth/users', '/auth/users/stats'],
  resetUserPassword: ['/auth/users']
});

// Enhanced Settings API with cache invalidation
export const settingsAPI = createEnhancedAPI({
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.put('/settings', data),
  resetSettings: () => api.post('/settings/reset'),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  testEmailConfig: (testEmail: string) => api.post('/settings/test-email', { testEmail }),
}, {
  updateSettings: ['/settings'],
  resetSettings: ['/settings'],
  uploadLogo: ['/settings']
});

// Enhanced Notifications API with cache invalidation
export const notificationsAPI = createEnhancedAPI({
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getStats: () => api.get('/notifications/stats'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  
  // Admin functions for creating notifications
  createNotification: (data: any) => api.post('/notifications', data),
  createBulkNotifications: (notifications: any[]) => api.post('/notifications/bulk', { notifications }),
  
  // System management functions
  getSystemStats: () => api.get('/notifications/system/stats'),
  cleanupExpiredNotifications: () => api.delete('/notifications/system/cleanup'),
}, {
  // Cache invalidation mappings
  createNotification: ['/notifications', '/notifications/unread-count', '/notifications/stats'],
  createBulkNotifications: ['/notifications', '/notifications/unread-count', '/notifications/stats'],
  markAsRead: ['/notifications', '/notifications/unread-count', '/notifications/stats'],
  markAllAsRead: ['/notifications', '/notifications/unread-count', '/notifications/stats'],
  deleteNotification: ['/notifications', '/notifications/unread-count', '/notifications/stats'],
  cleanupExpiredNotifications: ['/notifications', '/notifications/stats', '/notifications/system/stats']
});

// Network status monitoring
export const networkMonitor = {
  isOnline: () => typeof navigator !== 'undefined' ? navigator.onLine : true,
  addEventListener: (callback: (online: boolean) => void) => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => callback(true);
      const handleOffline = () => callback(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    return () => {};
  }
};

export { publicApi, retryRequest };
export default api;