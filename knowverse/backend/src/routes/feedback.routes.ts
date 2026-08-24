import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { feedbackSchema } from '../schemas';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/stats', requireAdmin, asyncHandler(feedbackController.getStats));
router.get('/', asyncHandler(feedbackController.list));
router.post('/', validate(feedbackSchema), asyncHandler(feedbackController.create));
router.post('/:id/respond', requireAdmin, asyncHandler(feedbackController.respond));

export default router;
