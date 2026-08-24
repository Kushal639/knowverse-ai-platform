import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth';
import asyncHandler from '../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(studentController.listStudents));
router.get('/:id', asyncHandler(studentController.getStudentProfile));

export default router;
