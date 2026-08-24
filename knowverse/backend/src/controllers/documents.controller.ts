import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const documentsController = {
  async list(req: AuthRequest, res: Response): Promise<void> {
    const { page = '1', limit = '20', datasetId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (datasetId) where.datasetId = datasetId;

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        select: { id: true, datasetId: true, title: true, source: true, createdAt: true, dataset: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
    ]);
    res.json({ success: true, data: { documents, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { dataset: { select: { id: true, name: true } } },
    });
    if (!document) throw new AppError('Document not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: document });
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { title, content, datasetId } = req.body;
    if (!title || !content || !datasetId) {
      res.status(422).json({ success: false, message: 'title, content, and datasetId are required', errorCode: 'VALIDATION_ERROR' });
      return;
    }
    const document = await prisma.document.create({
      data: { title, content, datasetId, source: 'manual' },
    });
    res.status(201).json({ success: true, data: document });
  },
};
