import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/prisma';
import logger from '../config/logger';

export const auditLog = (action: string, entityType?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Run after request completes by hooking into response finish
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      const result = originalJson(body);
      // Only log successful operations
      if (res.statusCode < 400) {
        prisma.auditLog.create({
          data: {
            userId: req.user?.id,
            action,
            entityType,
            entityId: req.params?.id,
            details: JSON.parse(JSON.stringify({
              method: req.method,
              path: req.path,
              body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
            })),
            ipAddress: req.ip,
          },
        }).catch((e) => logger.error('Audit log failed:', e));

        if (req.user?.id) {
          let title = action.replace(/_/g, ' ');
          let notifType: 'EXTRACTION' | 'GRAPH' | 'SYSTEM' | 'QUALITY' = 'SYSTEM';
          let link = '/dashboard';

          if (action.includes('ENTITY') || action.includes('GRAPH') || action.includes('RELATION')) {
            title = `Graph: ${action.replace(/_/g, ' ')}`;
            notifType = 'GRAPH';
            link = '/graph';
          } else if (action.includes('EXTRACTION') || action.includes('TRIPLE')) {
            title = `Extraction: ${action.replace(/_/g, ' ')}`;
            notifType = 'EXTRACTION';
            link = '/nlp';
          } else if (action.includes('DATASET') || action.includes('DOCUMENT')) {
            title = `Dataset: ${action.replace(/_/g, ' ')}`;
            notifType = 'SYSTEM';
            link = '/datasets';
          } else if (action.includes('FEEDBACK')) {
            title = `Feedback: ${action.replace(/_/g, ' ')}`;
            notifType = 'SYSTEM';
            link = '/feedback';
          }

          prisma.notification.create({
            data: {
              userId: req.user.id,
              title,
              message: `Successfully executed ${action.toLowerCase().replace(/_/g, ' ')}`,
              type: notifType,
              link,
            },
          }).catch((e) => logger.error('Notification creation failed:', e));
        }
      }
      return result;
    };
    next();
  };
};

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sensitive = ['password', 'passwordHash', 'token', 'secret'];
  const sanitized = { ...body };
  for (const key of sensitive) {
    if (key in sanitized) sanitized[key] = '[REDACTED]';
  }
  return sanitized;
}
