import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { chatSchema } from '../schemas';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.post('/chat', validate(chatSchema), asyncHandler(aiController.chat));
router.post('/explain-subgraph', asyncHandler(aiController.explainSubgraph));
router.get('/conversations', asyncHandler(aiController.getConversations));
router.get('/conversations/:id', asyncHandler(aiController.getConversation));
router.delete('/conversations/:id', asyncHandler(aiController.deleteConversation));

router.post('/insights', asyncHandler(aiController.saveInsight));
router.get('/insights', asyncHandler(aiController.getSavedInsights));
router.delete('/insights/:id', asyncHandler(aiController.deleteSavedInsight));

export default router;
