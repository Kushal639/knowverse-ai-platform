import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { recommendationService } from '../services/recommendation.service';

export const recommendationController = {
  async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    const entityId = req.query.entityId as string | undefined;
    const recommendations = await recommendationService.getRecommendations(entityId);
    res.json({ success: true, data: recommendations });
  },
};
