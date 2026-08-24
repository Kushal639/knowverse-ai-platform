import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { datasetService } from '../services/dataset.service';

export const datasetController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page, limit, search } = req.query as { page?: string; limit?: string; search?: string };
    const result = await datasetService.list(
      req.user!.id,
      req.user!.role,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search
    );
    res.json({ success: true, data: result });
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const dataset = await datasetService.getById(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, data: dataset });
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const dataset = await datasetService.create({ ...req.body, ownerId: req.user!.id });
    res.status(201).json({ success: true, data: dataset });
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const dataset = await datasetService.update(req.params.id, req.user!.id, req.user!.role, req.body);
    res.json({ success: true, data: dataset });
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    await datasetService.delete(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, message: 'Dataset deleted successfully' });
  },

  async upload(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded', errorCode: 'NO_FILE' });
      return;
    }
    const dataset = await datasetService.handleUpload(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.file
    );
    res.json({ success: true, message: 'File uploaded successfully', data: dataset });
  },
};
