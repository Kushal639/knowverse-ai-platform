import { Router } from 'express';
import { documentsController } from '../controllers/documents.controller';
import { authenticate } from '../middleware/auth';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(documentsController.list));
router.post('/', asyncHandler(documentsController.create));
router.get('/:id', asyncHandler(documentsController.getById));

export default router;
