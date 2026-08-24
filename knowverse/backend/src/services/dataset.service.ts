import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import logger from '../config/logger';

export const datasetService = {
  async list(userId: string, role: string, page = 1, limit = 20, search?: string) {
    const where = {
      ...(role !== 'ADMIN' && { ownerId: userId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [total, datasets] = await Promise.all([
      prisma.dataset.count({ where }),
      prisma.dataset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { documents: true } },
        },
      }),
    ]);

    return { datasets, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string, userId: string, role: string) {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        documents: {
          select: { id: true, title: true, source: true, createdAt: true },
        },
      },
    });

    if (!dataset) throw new AppError('Dataset not found', 404, 'NOT_FOUND');
    if (role !== 'ADMIN' && dataset.ownerId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    return dataset;
  },

  async create(data: { name: string; description?: string; ownerId: string }) {
    return prisma.dataset.create({
      data,
      include: { owner: { select: { id: true, name: true } } },
    });
  },

  async update(id: string, userId: string, role: string, data: { name?: string; description?: string }) {
    const dataset = await prisma.dataset.findUnique({ where: { id } });
    if (!dataset) throw new AppError('Dataset not found', 404, 'NOT_FOUND');
    if (role !== 'ADMIN' && dataset.ownerId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    return prisma.dataset.update({ where: { id }, data });
  },

  async delete(id: string, userId: string, role: string) {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: { documents: { select: { id: true } } },
    });
    if (!dataset) throw new AppError('Dataset not found', 404, 'NOT_FOUND');
    if (role !== 'ADMIN' && dataset.ownerId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    // Delete uploaded file if present
    if (dataset.filePath && fs.existsSync(dataset.filePath)) {
      try {
        fs.unlinkSync(dataset.filePath);
      } catch (e) {
        logger.warn('Failed to delete dataset file from disk:', e);
      }
    }

    const docIds = dataset.documents.map(d => d.id);

    await prisma.$transaction(async (tx) => {
      if (docIds.length > 0) {
        // 1. Find extraction runs for these docs
        const runs = await tx.extractionRun.findMany({
          where: { documentId: { in: docIds } },
          select: { id: true },
        });
        const runIds = runs.map(r => r.id);

        if (runIds.length > 0) {
          // 2. Delete extraction results
          await tx.extractionResult.deleteMany({
            where: { extractionRunId: { in: runIds } },
          });
          // 3. Delete extraction runs
          await tx.extractionRun.deleteMany({
            where: { id: { in: runIds } },
          });
        }

        // 4. Delete all triples created from these documents
        await tx.triple.deleteMany({
          where: { sourceDocumentId: { in: docIds } },
        });

        // 5. Delete documents
        await tx.document.deleteMany({
          where: { id: { in: docIds } },
        });
      }

      // 6. Delete dataset
      await tx.dataset.delete({ where: { id } });
    });

    // 7. Clean up orphaned entities & relations with no remaining triples
    try {
      const orphanedEntities = await prisma.entity.findMany({
        where: {
          subjectTriples: { none: {} },
          objectTriples: { none: {} },
        },
        select: { id: true },
      });
      if (orphanedEntities.length > 0) {
        await prisma.entity.deleteMany({
          where: { id: { in: orphanedEntities.map(e => e.id) } },
        });
      }

      const orphanedRelations = await prisma.relation.findMany({
        where: { triples: { none: {} } },
        select: { id: true },
      });
      if (orphanedRelations.length > 0) {
        await prisma.relation.deleteMany({
          where: { id: { in: orphanedRelations.map(r => r.id) } },
        });
      }
    } catch (err) {
      logger.warn('Failed cleaning orphaned entities:', err);
    }
  },

  async handleUpload(
    datasetId: string,
    userId: string,
    role: string,
    file: Express.Multer.File
  ) {
    const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
    if (!dataset) throw new AppError('Dataset not found', 404, 'NOT_FOUND');
    if (role !== 'ADMIN' && dataset.ownerId !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    // Detect content and create document
    const content = fs.readFileSync(file.path, 'utf-8');

    await prisma.$transaction(async (tx) => {
      await tx.dataset.update({
        where: { id: datasetId },
        data: {
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
          status: 'UPLOADED',
        },
      });

      await tx.document.create({
        data: {
          datasetId,
          title: file.originalname,
          content: content.substring(0, 1000000), // limit 1MB text
          source: 'upload',
          metadata: {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          },
        },
      });
    });

    return prisma.dataset.findUnique({ where: { id: datasetId } });
  },
};
