import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(recommendationController.getRecommendations));

export default router;
