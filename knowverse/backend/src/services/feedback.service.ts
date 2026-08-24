import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export const feedbackService = {
  async create(userId: string, data: { rating: number; comment?: string }) {
    return prisma.feedback.create({
      data: { userId, rating: data.rating, comment: data.comment },
      include: { user: { select: { id: true, name: true } } },
    });
  },

  async list(userId: string, role: string, page = 1, limit = 20) {
    const where = role !== 'ADMIN' ? { userId } : {};
    const [total, items] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { feedback: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async respond(id: string, adminResponse: string) {
    const feedback = await prisma.feedback.findUnique({ where: { id } });
    if (!feedback) throw new AppError('Feedback not found', 404, 'NOT_FOUND');
    return prisma.feedback.update({
      where: { id },
      data: { adminResponse, status: 'REVIEWED' },
    });
  },

  async getStats() {
    const [total, byRating, byStatus] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.groupBy({ by: ['rating'], _count: { _all: true }, orderBy: { rating: 'asc' } }),
      prisma.feedback.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const avgResult = await prisma.feedback.aggregate({ _avg: { rating: true } });
    return {
      total,
      averageRating: avgResult._avg.rating || 0,
      byRating: byRating.map(r => ({ rating: r.rating, count: r._count._all })),
      byStatus: byStatus.reduce((acc, s) => { acc[s.status.toLowerCase()] = s._count._all; return acc; }, {} as Record<string, number>),
    };
  },
};
