import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const datasetSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const feedbackSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(5000).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const entitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(500),
    entityType: z.string().max(100).optional(),
    description: z.string().max(5000).optional(),
    aliases: z.array(z.string().max(500)).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const relationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(500),
    description: z.string().max(5000).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(10000),
    conversationId: z.string().uuid().optional().nullable(),
    currentRoute: z.string().optional(),
    mode: z.enum(['beginner', 'expert']).optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const mergeEntitySchema = z.object({
  body: z.object({
    sourceEntityId: z.string().uuid(),
    targetEntityId: z.string().uuid(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const renameEntitySchema = z.object({
  body: z.object({
    newName: z.string().min(1).max(500),
  }),
  query: z.object({}),
  params: z.object({ id: z.string().uuid() }),
});

export const paginationSchema = z.object({
  body: z.object({}),
  query: z.object({
    page: z.string().optional().transform(v => v ? parseInt(v) : 1),
    limit: z.string().optional().transform(v => v ? Math.min(parseInt(v), 100) : 20),
    search: z.string().optional(),
  }),
  params: z.object({}),
});
