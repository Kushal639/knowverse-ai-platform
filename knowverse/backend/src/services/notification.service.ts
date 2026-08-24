import prisma from '../config/prisma';

export const notificationService = {
  async createNotification(data: {
    userId?: string;
    title: string;
    message: string;
    type?: 'EXTRACTION' | 'GRAPH' | 'SYSTEM' | 'QUALITY';
    link?: string;
  }) {
    let targetUserId = data.userId;
    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst();
      targetUserId = firstUser?.id;
    }
    if (!targetUserId) return null;

    return prisma.notification.create({
      data: {
        userId: targetUserId,
        title: data.title,
        message: data.message,
        type: data.type || 'SYSTEM',
        link: data.link,
      },
    });
  },

  async getUserNotifications(userId: string, limit = 25) {
    // 1. Fetch persistent notifications from DB
    const dbNotifs = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // 2. Also fetch recent audit logs and extraction runs to construct a rich live stream of everything done on the site
    const [recentAuditLogs, recentRuns] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.extractionRun.findMany({
        where: { userId },
        include: { document: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Map audit logs to readable notifications if not already captured
    const synthesized: Array<{
      id: string;
      title: string;
      message: string;
      type: 'EXTRACTION' | 'GRAPH' | 'SYSTEM' | 'QUALITY';
      link?: string;
      isRead: boolean;
      createdAt: Date;
    }> = [];

    recentAuditLogs.forEach(log => {
      let title = 'Action Performed';
      let type: 'EXTRACTION' | 'GRAPH' | 'SYSTEM' | 'QUALITY' = 'SYSTEM';
      let link = '/dashboard';

      if (log.action.includes('ENTITY') || log.action.includes('GRAPH')) {
        title = `Graph Operation: ${log.action.replace(/_/g, ' ')}`;
        type = 'GRAPH';
        link = '/graph';
      } else if (log.action.includes('EXTRACTION') || log.action.includes('TRIPLE')) {
        title = `Extraction: ${log.action.replace(/_/g, ' ')}`;
        type = 'EXTRACTION';
        link = '/nlp';
      } else if (log.action.includes('DATASET') || log.action.includes('DOCUMENT')) {
        title = `Dataset: ${log.action.replace(/_/g, ' ')}`;
        type = 'SYSTEM';
        link = '/datasets';
      }

      synthesized.push({
        id: `audit-${log.id}`,
        title,
        message: log.details ? JSON.stringify(log.details) : `Executed ${log.action} on ${log.entityType || 'resource'}`,
        type,
        link,
        isRead: false,
        createdAt: log.createdAt,
      });
    });

    recentRuns.forEach(run => {
      synthesized.push({
        id: `run-${run.id}`,
        title: `NLP Extraction ${run.status}`,
        message: `Extraction run for "${run.document?.title || 'Document'}" completed with status: ${run.status}`,
        type: 'EXTRACTION',
        link: '/nlp',
        isRead: false,
        createdAt: run.createdAt,
      });
    });

    // Merge and deduplicate by timestamp/title
    const combined = [...dbNotifs, ...synthesized]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const unreadCount = combined.filter(n => !n.isRead).length;

    return {
      notifications: combined,
      unreadCount,
    };
  },

  async markAsRead(id: string, userId: string) {
    if (id.startsWith('audit-') || id.startsWith('run-')) {
      return { success: true };
    }
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async clearAll(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },
};
