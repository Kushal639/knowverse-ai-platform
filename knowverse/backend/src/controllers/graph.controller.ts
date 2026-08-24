import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { graphService } from '../services/graph.service';

export const graphController = {
  async getGraph(req: AuthRequest, res: Response): Promise<void> {
    const { status, entityType, minConfidence, datasetId, documentId, search, page, limit } = req.query as Record<string, string>;
    const result = await graphService.getGraph({
      status,
      entityType,
      minConfidence: minConfidence ? parseFloat(minConfidence) : undefined,
      datasetId,
      documentId,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? Math.min(parseInt(limit), 1000) : 500,
    });
    res.json({ success: true, data: result });
  },

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const stats = await graphService.getStats();
    res.json({ success: true, data: stats });
  },

  async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
    const analytics = await graphService.getAnalytics();
    res.json({ success: true, data: analytics });
  },

  async getCommunities(req: AuthRequest, res: Response): Promise<void> {
    const clusters = await graphService.getCommunities();
    res.json({ success: true, data: clusters });
  },

  async detectDuplicates(req: AuthRequest, res: Response): Promise<void> {
    const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 0.7;
    const candidates = await graphService.detectDuplicates(threshold);
    res.json({ success: true, data: candidates });
  },

  async searchGraph(req: AuthRequest, res: Response): Promise<void> {
    const query = (req.query.q as string || '').trim();
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const results = await graphService.searchGraph(query, limit);
    res.json({ success: true, data: results });
  },

  async getEntities(req: AuthRequest, res: Response): Promise<void> {
    const { page, limit, search } = req.query as Record<string, string>;
    const result = await graphService.getEntities(req.user!.id, req.user!.role, parseInt(page || '1'), parseInt(limit || '20'), search);
    res.json({ success: true, data: result });
  },

  async getEntity(req: AuthRequest, res: Response): Promise<void> {
    const entity = await graphService.getEntity(req.params.id);
    res.json({ success: true, data: entity });
  },

  async getTripleProvenance(req: AuthRequest, res: Response): Promise<void> {
    const triple = await graphService.getTripleProvenance(req.params.id);
    res.json({ success: true, data: triple });
  },

  async createEntity(req: AuthRequest, res: Response): Promise<void> {
    const entity = await graphService.createEntity(req.body, req.user?.id);
    res.status(201).json({ success: true, data: entity });
  },

  async updateEntity(req: AuthRequest, res: Response): Promise<void> {
    const entity = await graphService.updateEntity(req.params.id, req.body, req.user!.id, req.user!.role);
    res.json({ success: true, data: entity });
  },

  async deleteEntity(req: AuthRequest, res: Response): Promise<void> {
    await graphService.deleteEntity(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, message: 'Entity deleted' });
  },

  async renameEntity(req: AuthRequest, res: Response): Promise<void> {
    const entity = await graphService.renameEntity(req.params.id, req.body.newName, req.user!.id, req.user!.role);
    res.json({ success: true, data: entity });
  },

  async mergeEntities(req: AuthRequest, res: Response): Promise<void> {
    const entity = await graphService.mergeEntities(req.body.sourceEntityId, req.body.targetEntityId, req.user!.id, req.user!.role);
    res.json({ success: true, data: entity });
  },

  async getRelations(req: AuthRequest, res: Response): Promise<void> {
    const { search } = req.query as { search?: string };
    const relations = await graphService.getRelations(search);
    res.json({ success: true, data: relations });
  },

  async createRelation(req: AuthRequest, res: Response): Promise<void> {
    const relation = await graphService.createRelation(req.body, req.user?.id);
    res.status(201).json({ success: true, data: relation });
  },

  async getNeighborhood(req: AuthRequest, res: Response): Promise<void> {
    const depth = parseInt(req.query.depth as string || '2');
    const entityType = req.query.entityType as string | undefined;
    const minConfidence = req.query.minConfidence ? parseFloat(req.query.minConfidence as string) : undefined;
    const result = await graphService.getNeighborhood(req.params.id, depth, { entityType, minConfidence });
    res.json({ success: true, data: result });
  },

  async shortestPath(req: AuthRequest, res: Response): Promise<void> {
    const { from, to } = req.query as { from: string; to: string };
    const result = await graphService.shortestPath(from, to);
    res.json({ success: true, data: result });
  },

  async rollbackVersion(req: AuthRequest, res: Response): Promise<void> {
    const result = await graphService.rollbackVersion(req.params.id, req.user?.id);
    res.json({ success: true, data: result });
  },

  async clearGraph(req: AuthRequest, res: Response): Promise<void> {
    const result = await graphService.clearAllGraph();
    res.json({ success: true, data: result });
  },
};
