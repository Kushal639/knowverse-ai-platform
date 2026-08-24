import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(notificationController.list));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));
router.post('/read-all', asyncHandler(notificationController.markAllAsRead));
router.delete('/clear', asyncHandler(notificationController.clearAll));

export default router;
