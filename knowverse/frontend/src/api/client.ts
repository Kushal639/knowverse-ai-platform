import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
