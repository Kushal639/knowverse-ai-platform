import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { feedbackService } from '../services/feedback.service';

export const feedbackController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const fb = await feedbackService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: fb });
  },
  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page, limit } = req.query as Record<string, string>;
    const result = await feedbackService.list(req.user!.id, req.user!.role, parseInt(page || '1'), parseInt(limit || '20'));
    res.json({ success: true, data: result });
  },
  async respond(req: AuthRequest, res: Response): Promise<void> {
    const fb = await feedbackService.respond(req.params.id, req.body.adminResponse);
    res.json({ success: true, data: fb });
  },
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const stats = await feedbackService.getStats();
    res.json({ success: true, data: stats });
  },
};
