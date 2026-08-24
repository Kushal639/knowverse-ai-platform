import { Router } from 'express';
import { datasetController } from '../controllers/dataset.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { datasetSchema } from '../schemas';
import { upload } from '../utils/fileUpload';
import { auditLog } from '../middleware/auditLog';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(datasetController.list));
router.post('/', validate(datasetSchema), auditLog('CREATE_DATASET', 'Dataset'), asyncHandler(datasetController.create));
router.get('/:id', asyncHandler(datasetController.getById));
router.put('/:id', validate(datasetSchema), auditLog('UPDATE_DATASET', 'Dataset'), asyncHandler(datasetController.update));
router.delete('/:id', auditLog('DELETE_DATASET', 'Dataset'), asyncHandler(datasetController.delete));
router.post('/:id/upload', upload.single('file'), auditLog('UPLOAD_FILE', 'Dataset'), asyncHandler(datasetController.upload));

export default router;
