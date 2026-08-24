import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';
import asyncHandler from '../utils/asyncHandler';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireAdmin);

// ── Stats ─────────────────────────────────────────────────────
router.get('/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const [users, datasets, entities, relations, pendingTriples, openFeedback, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.dataset.count(),
    prisma.entity.count(),
    prisma.relation.count(),
    prisma.triple.count({ where: { status: 'PENDING' } }),
    prisma.feedback.count({ where: { status: 'OPEN' } }),
    prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
  ]);
  const activeUsers = await prisma.user.count({ where: { isActive: true } });
  res.json({ success: true, data: { users, activeUsers, datasets, entities, relations, pendingTriples, openFeedback, recentActivity: auditLogs } });
}));

// ── Users ─────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', search, role } = req.query as Record<string, string>;
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
  if (role) where.role = role;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { datasets: true, feedback: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
  ]);
  res.json({ success: true, data: { users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
}));

router.get('/users/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true, _count: { select: { datasets: true, feedback: true, triples: true } } },
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: user });
}));

router.patch('/users/:id/status', auditLog('UPDATE_USER_STATUS', 'User'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') { res.status(422).json({ success: false, message: 'isActive must be boolean', errorCode: 'VALIDATION_ERROR' }); return; }
  if (req.params.id === req.user!.id) throw new AppError('Cannot deactivate your own account', 400, 'INVALID_OPERATION');
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive }, select: { id: true, name: true, isActive: true } });
  res.json({ success: true, data: user });
}));

router.patch('/users/:id/role', auditLog('UPDATE_USER_ROLE', 'User'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!['USER', 'ADMIN'].includes(role)) { res.status(422).json({ success: false, message: 'Invalid role', errorCode: 'VALIDATION_ERROR' }); return; }
  if (req.params.id === req.user!.id) throw new AppError('Cannot change your own role', 400, 'INVALID_OPERATION');
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role }, select: { id: true, name: true, role: true } });
  res.json({ success: true, data: user });
}));

// ── Audit Logs ─────────────────────────────────────────────────
router.get('/audit-logs', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', userId, action } = req.query as Record<string, string>;
  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (action) where.action = { contains: action };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
  ]);
  res.json({ success: true, data: { logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
}));

// ── Graph Versions ─────────────────────────────────────────────
router.get('/graph/versions', asyncHandler(async (req: AuthRequest, res: Response) => {
  const versions = await prisma.graphVersion.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, name: true } }, _count: { select: { changes: true } } },
    take: 50,
  });
  res.json({ success: true, data: versions });
}));

router.get('/graph/versions/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const version = await prisma.graphVersion.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: { select: { id: true, name: true } },
      changes: {
        include: {
          createdBy: { select: { id: true, name: true } },
          entity: { select: { id: true, name: true } },
          relation: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!version) throw new AppError('Graph version not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: version });
}));

export default router;
