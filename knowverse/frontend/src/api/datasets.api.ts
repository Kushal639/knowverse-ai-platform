import api from './client';
import { Dataset } from '@/types';

export const datasetsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/datasets', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Dataset }>(`/datasets/${id}`).then(r => r.data),

  create: (data: { name: string; description?: string }) =>
    api.post('/datasets', data).then(r => r.data),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/datasets/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/datasets/${id}`).then(r => r.data),

  uploadFile: (datasetId: string, file: File, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/datasets/${datasetId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }).then(r => r.data);
  },
};
