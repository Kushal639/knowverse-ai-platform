import { Router } from 'express';
import { extractionController } from '../controllers/extraction.controller';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(extractionController.listExtractionRuns));
router.post('/', auditLog('START_EXTRACTION', 'ExtractionRun'), asyncHandler(extractionController.startExtraction));
router.get('/document/:documentId/schema', asyncHandler(extractionController.getSchema));
router.get('/document/:documentId', asyncHandler(extractionController.getDocumentExtractions));
router.get('/:id', asyncHandler(extractionController.getExtractionRun));
router.post('/:id/approve', auditLog('APPROVE_TRIPLE', 'ExtractionResult'), asyncHandler(extractionController.approveResult));
router.post('/:id/reject', asyncHandler(extractionController.rejectResult));
router.post('/:id/approve-all', auditLog('APPROVE_ALL_TRIPLES', 'ExtractionRun'), asyncHandler(extractionController.approveAll));
router.post('/:id/reject-all', asyncHandler(extractionController.rejectAll));

export default router;
