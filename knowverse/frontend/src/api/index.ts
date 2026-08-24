import api from './client';

export const extractionsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/extractions', { params }).then(r => r.data),

  getSchema: (documentId: string) =>
    api.get<{ success: boolean; data: import('@/types').DocumentSchemaInfo }>(`/extractions/document/${documentId}/schema`).then(r => r.data),

  start: (documentId: string, options?: { mode?: string; columnMapping?: Record<string, string>; model?: string; autoApprove?: boolean }) =>
    api.post('/extractions', { documentId, ...options }).then(r => r.data),

  getById: (id: string) => api.get(`/extractions/${id}`).then(r => r.data),

  approve: (resultId: string) =>
    api.post(`/extractions/${resultId}/approve`).then(r => r.data),

  reject: (resultId: string) =>
    api.post(`/extractions/${resultId}/reject`).then(r => r.data),

  approveAll: (runId: string) =>
    api.post(`/extractions/${runId}/approve-all`).then(r => r.data),

  rejectAll: (runId: string) =>
    api.post(`/extractions/${runId}/reject-all`).then(r => r.data),

  getForDocument: (documentId: string) =>
    api.get(`/extractions/document/${documentId}`).then(r => r.data),
};

export const documentsApi = {
  list: (params?: { page?: number; limit?: number; datasetId?: string }) =>
    api.get('/documents', { params }).then(r => r.data),

  getById: (id: string) => api.get(`/documents/${id}`).then(r => r.data),

  create: (data: { title: string; content: string; datasetId: string }) =>
    api.post('/documents', data).then(r => r.data),
};

export const feedbackApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/feedback', { params }).then(r => r.data),

  create: (data: { rating: number; comment?: string }) =>
    api.post('/feedback', data).then(r => r.data),

  respond: (id: string, adminResponse: string) =>
    api.post(`/feedback/${id}/respond`, { adminResponse }).then(r => r.data),

  getStats: () => api.get('/feedback/stats').then(r => r.data),
};

export const aiApi = {
  chat: (message: string, conversationId?: string, currentRoute?: string, mode?: 'beginner' | 'expert') =>
    api.post('/ai/chat', { message, conversationId, currentRoute, mode }).then(r => r.data),

  explainSubgraph: (entityIds: string[]) =>
    api.post('/ai/explain-subgraph', { entityIds }).then(r => r.data),

  getConversations: () => api.get('/ai/conversations').then(r => r.data),

  getConversation: (id: string) => api.get(`/ai/conversations/${id}`).then(r => r.data),

  deleteConversation: (id: string) => api.delete(`/ai/conversations/${id}`).then(r => r.data),

  saveInsight: (data: { question: string; answer: string; sources?: any; metadata?: any }) =>
    api.post('/ai/insights', data).then(r => r.data),

  getSavedInsights: () => api.get('/ai/insights').then(r => r.data),

  deleteSavedInsight: (id: string) => api.delete(`/ai/insights/${id}`).then(r => r.data),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats').then(r => r.data),

  listUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/admin/users', { params }).then(r => r.data),

  getUser: (id: string) => api.get(`/admin/users/${id}`).then(r => r.data),

  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch(`/admin/users/${id}/status`, { isActive }).then(r => r.data),

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),

  getAuditLogs: (params?: { page?: number; limit?: number; userId?: string; action?: string }) =>
    api.get('/admin/audit-logs', { params }).then(r => r.data),

  getGraphVersions: () => api.get('/admin/graph/versions').then(r => r.data),

  getGraphVersion: (id: string) => api.get(`/admin/graph/versions/${id}`).then(r => r.data),
};

export const studentsApi = {
  list: (search?: string) =>
    api.get('/students', { params: { search } }).then(r => r.data),

  getProfile: (id: string, role?: string) =>
    api.get(`/students/${id}`, { params: { role } }).then(r => r.data),
};

export const recommendationsApi = {
  get: (entityId?: string) =>
    api.get('/recommendations', { params: { entityId } }).then(r => r.data),
};

export const healthApi = {
  getKnowledgeHealth: () =>
    api.get('/health/knowledge').then(r => r.data),
};

export const modelEvalApi = {
  getBenchmarks: () =>
    api.get('/admin/models/benchmarks').then(r => r.data),
};

export const notificationsApi = {
  list: (limit = 25) =>
    api.get('/notifications', { params: { limit } }).then(r => r.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    api.post('/notifications/read-all').then(r => r.data),

  clearAll: () =>
    api.delete('/notifications/clear').then(r => r.data),
};


