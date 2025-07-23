import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Create axios instance for public requests (no auth required)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add auth token for authenticated API
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for public API (optional auth)
publicApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for authenticated API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      Cookies.remove('cms_token');
      // Redirect to login for protected routes
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Response interceptor for public API (no redirects on 401)
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized but don't redirect
      Cookies.remove('cms_token');
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/password', data),
};

// Posts API endpoints
export const postsAPI = {
  getPosts: (params?: any) => publicApi.get('/posts', { params }),
  getPost: (id: string) => publicApi.get(`/posts/${id}`),
  createPost: (data: any) => api.post('/posts', data),
  updatePost: (id: string, data: any) => api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
  savePostDraft: (id: string, data: any) => api.post(`/posts/${id}/save-draft`, data),
};

// Pages API endpoints
export const pagesAPI = {
  getPages: (params?: any) => publicApi.get('/pages', { params }),
  getPage: (id: string) => publicApi.get(`/pages/${id}`),
  createPage: (data: any) => api.post('/pages', data),
  updatePage: (id: string, data: any) => api.put(`/pages/${id}`, data),
  deletePage: (id: string) => api.delete(`/pages/${id}`),
  getMenuPages: () => publicApi.get('/pages/menu'),
  getHomePage: () => publicApi.get('/pages/homepage'),
};

// Media API endpoints
export const mediaAPI = {
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
};

// Analytics API endpoints
export const analyticsAPI = {
  getDashboardOverview: (params?: any) => api.get('/analytics/overview', { params }),
  getContentPerformance: (params?: any) => api.get('/analytics/content', { params }),
  getTrafficAnalytics: (params?: any) => api.get('/analytics/traffic', { params }),
  getUserAnalytics: (params?: any) => api.get('/analytics/users', { params }),
  getMediaAnalytics: (params?: any) => api.get('/analytics/media', { params }),
  getSearchAnalytics: (params?: any) => api.get('/analytics/search', { params }),
  exportAnalytics: (params?: any) => api.get('/analytics/export', { params }),
};

export { publicApi };
export default api;