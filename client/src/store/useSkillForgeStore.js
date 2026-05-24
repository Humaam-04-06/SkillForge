import { create } from 'zustand';

export const useSkillForgeStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('skillforge_token') || null,
  isAuthenticated: !!localStorage.getItem('skillforge_token'),
  theme: localStorage.getItem('skillforge_theme') || 'dark',
  apiKey: localStorage.getItem('skillforge_api_key') || '',
  aiProvider: 'gemini',

  login: (token, user) => {
    localStorage.setItem('skillforge_token', token);
    set({ token, user, isAuthenticated: true });
    
    // Sync theme
    if (user && user.theme) {
      get().setTheme(user.theme);
    }
    
    // Sync API Key if user has one saved in DB
    if (user && user.apiKey && !get().apiKey) {
      get().setApiKey(user.apiKey);
    }
  },

  logout: () => {
    localStorage.removeItem('skillforge_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user });
    if (user && user.theme) {
      get().setTheme(user.theme);
    }
    if (user && user.apiKey && !get().apiKey) {
      get().setApiKey(user.apiKey);
    }
  },

  setTheme: (theme) => {
    localStorage.setItem('skillforge_theme', theme);
    set({ theme });
    
    // Update HTML classes for Tailwind CSS
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setApiKey: (apiKey) => {
    localStorage.setItem('skillforge_api_key', apiKey);
    set({ apiKey });
  }
}));
