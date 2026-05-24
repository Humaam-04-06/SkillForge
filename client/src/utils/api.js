import axios from 'axios';
import { useSkillForgeStore } from '../store/useSkillForgeStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // AI calls might take time
});

// Request Interceptor: Attach JWT token and custom x-api-key
api.interceptors.request.use(
  (config) => {
    const state = useSkillForgeStore.getState();
    
    // Add JWT Token
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }

    // Add BYOK Gemini API Key
    if (state.apiKey) {
      config.headers['x-api-key'] = state.apiKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout on token expiration or deletion
      useSkillForgeStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
