import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'colorful' | 'cosmic' | 'ocean';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
          
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        let nextTheme: Theme;
        
        switch (currentTheme) {
          case 'light':
            nextTheme = 'dark';
            break;
          case 'dark':
            nextTheme = 'colorful';
            break;
          case 'colorful':
            nextTheme = 'cosmic';
            break;
          case 'cosmic':
            nextTheme = 'ocean';
            break;
          case 'ocean':
            nextTheme = 'light';
            break;
          default:
            nextTheme = 'light';
        }
        
        get().setTheme(nextTheme);
      },
    }),
    {
      name: 'cms-theme-storage',
    }
  )
);

// Theme configurations
export const themeConfig = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
    }
  },
  colorful: {
    name: 'Colorful',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#06b6d4',
      background: '#fef7ff',
      surface: '#f3e8ff',
      text: '#581c87',
    }
  },
  cosmic: {
    name: 'Cosmic',
    colors: {
      primary: '#9333ea',
      secondary: '#f59e0b',
      accent: '#06b6d4',
      background: '#0c0a1a',
      surface: '#1a1625',
      text: '#e2e8f0',
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#10b981',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
    }
  }
};

// Initialize theme on app start
export const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('cms-theme-storage');
    let theme: Theme = 'light';
    
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        theme = parsed.state.theme || 'light';
      } catch (e) {
        console.error('Error parsing saved theme:', e);
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};