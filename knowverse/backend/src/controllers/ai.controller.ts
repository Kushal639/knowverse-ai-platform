import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';

export const aiController = {
  async chat(req: AuthRequest, res: Response): Promise<void> {
    const { message, conversationId, currentRoute, mode } = req.body;
    const result = await aiService.chat(req.user!.id, message, conversationId, { currentRoute, mode });
    res.json({ success: true, data: result });
  },

  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    const conversations = await aiService.getConversations(req.user!.id);
    res.json({ success: true, data: conversations });
  },

  async getConversation(req: AuthRequest, res: Response): Promise<void> {
    const conversation = await aiService.getConversation(req.params.id, req.user!.id);
    res.json({ success: true, data: conversation });
  },

  async deleteConversation(req: AuthRequest, res: Response): Promise<void> {
    await aiService.deleteConversation(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Conversation deleted' });
  },

  async explainSubgraph(req: AuthRequest, res: Response): Promise<void> {
    const { entityIds } = req.body;
    const result = await aiService.explainSubgraph(entityIds);
    res.json({ success: true, data: result });
  },

  async saveInsight(req: AuthRequest, res: Response): Promise<void> {
    const insight = await aiService.saveInsight(req.user!.id, req.body);
    res.status(201).json({ success: true, data: insight });
  },

  async getSavedInsights(req: AuthRequest, res: Response): Promise<void> {
    const insights = await aiService.getSavedInsights(req.user!.id);
    res.json({ success: true, data: insights });
  },

  async deleteSavedInsight(req: AuthRequest, res: Response): Promise<void> {
    await aiService.deleteSavedInsight(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Insight deleted' });
  },
};
