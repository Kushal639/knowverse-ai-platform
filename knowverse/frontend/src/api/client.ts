import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { handleMockRoute } from './mockFallback';

const customApiUrl = (import.meta as any).env?.VITE_API_URL;
const apiClient = axios.create({
  baseURL: customApiUrl
    ? (customApiUrl.endsWith('/api') ? customApiUrl : `${customApiUrl}/api`)
    : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Direct adapter for standalone Vercel cloud hosting
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If on Vercel and no external API URL is set, resolve directly via mock fallback engine
  if (typeof window !== 'undefined' && !customApiUrl && window.location.hostname.includes('vercel.app')) {
    config.adapter = async (cfg) => {
      const method = (cfg.method || 'get').toLowerCase();
      const url = cfg.url || '';
      const bodyData = cfg.data ? (typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data) : undefined;
      const mockData = handleMockRoute(url, method, bodyData);
      return {
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: cfg,
      };
    };
  }

  return config;
});

// Response interceptor with graceful mock fallback for any unhandled network errors
apiClient.interceptors.response.use(
  (response) => {
    // Detect if Vercel SPA rewrite returned index.html for an API route
    if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE html>') || response.data.includes('<!doctype html>') || response.data.includes('<html'))) {
      const method = (response.config.method || 'get').toLowerCase();
      const url = response.config.url || '';
      const bodyData = response.config.data ? (typeof response.config.data === 'string' ? JSON.parse(response.config.data) : response.config.data) : undefined;
      const mockData = handleMockRoute(url, method, bodyData);
      return { ...response, data: mockData };
    }
    return response;
  },
  (error) => {
    if (error.config) {
      try {
        const method = (error.config.method || 'get').toLowerCase();
        const url = error.config.url || '';
        const bodyData = error.config.data ? (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : undefined;
        const mockData = handleMockRoute(url, method, bodyData);
        if (mockData !== undefined) {
          return Promise.resolve({ data: mockData, status: 200, statusText: 'OK', headers: {}, config: error.config });
        }
      } catch (e) {
        // Fallback to standard error handling
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
