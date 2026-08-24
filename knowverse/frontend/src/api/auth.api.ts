import api from './client';
import { User } from '@/types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', data).then(r => r.data),

  logout: () => api.post('/auth/logout').then(r => r.data),

  me: () => api.get<{ success: boolean; data: User }>('/auth/me').then(r => r.data),
};
