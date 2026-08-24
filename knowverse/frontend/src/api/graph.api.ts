import api from './client';

export const graphApi = {
  getGraph: (params?: {
    status?: string;
    entityType?: string;
    minConfidence?: number;
    datasetId?: string;
    documentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/graph', { params }).then(r => r.data),

  getStats: () => api.get('/graph/stats').then(r => r.data),

  getAnalytics: () => api.get('/graph/analytics').then(r => r.data),

  getClusters: () => api.get('/graph/clusters').then(r => r.data),

  detectDuplicates: (threshold = 0.7) =>
    api.get('/graph/duplicates', { params: { threshold } }).then(r => r.data),

  searchGraph: (q: string, limit = 20) =>
    api.get('/graph/search', { params: { q, limit } }).then(r => r.data),

  getEntities: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/graph/entities', { params }).then(r => r.data),

  getEntity: (id: string) => api.get(`/graph/entities/${id}`).then(r => r.data),

  getTripleProvenance: (tripleId: string) =>
    api.get(`/graph/triples/${tripleId}/provenance`).then(r => r.data),

  createEntity: (data: { name: string; entityType?: string; description?: string; aliases?: string[] }) =>
    api.post('/graph/entities', data).then(r => r.data),

  updateEntity: (id: string, data: { name?: string; entityType?: string; description?: string }) =>
    api.put(`/graph/entities/${id}`, data).then(r => r.data),

  deleteEntity: (id: string) => api.delete(`/graph/entities/${id}`).then(r => r.data),

  renameEntity: (id: string, newName: string) =>
    api.post(`/graph/entities/${id}/rename`, { newName }).then(r => r.data),

  mergeEntities: (sourceEntityId: string, targetEntityId: string) =>
    api.post('/graph/entities/merge', { sourceEntityId, targetEntityId }).then(r => r.data),

  getRelations: (search?: string) =>
    api.get('/graph/relations', { params: { search } }).then(r => r.data),

  createRelation: (data: { name: string; description?: string }) =>
    api.post('/graph/relations', data).then(r => r.data),

  getNeighborhood: (entityId: string, depth = 2, params?: { entityType?: string; minConfidence?: number }) =>
    api.get(`/graph/entities/${entityId}/neighborhood`, { params: { depth, ...params } }).then(r => r.data),

  getShortestPath: (from: string, to: string) =>
    api.get('/graph/shortest-path', { params: { from, to } }).then(r => r.data),

  rollbackVersion: (versionId: string) =>
    api.post(`/graph/versions/${versionId}/rollback`).then(r => r.data),

  clearGraph: () =>
    api.post('/graph/clear').then(r => r.data),
};
