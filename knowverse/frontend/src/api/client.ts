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

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with graceful mock fallback for standalone / Vercel cloud deployment
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable or returns 404 / 502 / Network Error (e.g. static Vercel host without live backend server)
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404 || error.response?.status === 502;
    if (isNetworkError && error.config) {
      try {
        const method = (error.config.method || 'get').toLowerCase();
        const url = error.config.url || '';
        const bodyData = error.config.data ? (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : undefined;
        const mockData = handleMockRoute(url, method, bodyData);
        if (mockData) {
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
