import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';

export const notificationController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;
    const result = await notificationService.getUserNotifications(req.user!.id, limit);
    res.json({ success: true, data: result });
  },

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Notification marked as read' });
  },

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  },

  async clearAll(req: AuthRequest, res: Response): Promise<void> {
    await notificationService.clearAll(req.user!.id);
    res.json({ success: true, message: 'Notifications cleared' });
  },
};
