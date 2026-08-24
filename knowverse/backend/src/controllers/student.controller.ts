import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { studentService } from '../services/student.service';

export const studentController = {
  async listStudents(req: AuthRequest, res: Response): Promise<void> {
    const search = req.query.search as string | undefined;
    const students = await studentService.listStudents(search);
    res.json({ success: true, data: students });
  },

  async getStudentProfile(req: AuthRequest, res: Response): Promise<void> {
    const role = req.query.role as string | undefined;
    const profile = await studentService.getStudentProfile(req.params.id, role);
    res.json({ success: true, data: profile });
  },
};
