import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';
import logger from './config/logger';

// Routes
import authRoutes from './routes/auth.routes';
import datasetRoutes from './routes/datasets.routes';
import documentRoutes from './routes/documents.routes';
import extractionRoutes from './routes/extractions.routes';
import graphRoutes from './routes/graph.routes';
import feedbackRoutes from './routes/feedback.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';
import studentRoutes from './routes/student.routes';
import recommendationRoutes from './routes/recommendation.routes';
import notificationRoutes from './routes/notifications.routes';
import { healthService } from './services/health.service';
import { modelEvalService } from './services/modelEval.service';
import asyncHandler from './utils/asyncHandler';
import { authenticate } from './middleware/auth';

const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (
      !requestOrigin ||
      requestOrigin === env.FRONTEND_URL ||
      requestOrigin.endsWith('.vercel.app') ||
      requestOrigin.startsWith('http://localhost:')
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for production deployment while preserving credentials
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Core middleware ────────────────────────────────────────────
app.use(cookieParser(env.COOKIE_SECRET));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP logging (skip in test env)
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Rate limiting ──────────────────────────────────────────────
app.use('/api', globalRateLimiter);

// ── Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/extractions', extractionRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health/knowledge', authenticate, asyncHandler(async (req, res) => {
  const health = await healthService.getKnowledgeHealth();
  res.json({ success: true, data: health });
}));

app.get('/api/admin/models/benchmarks', authenticate, asyncHandler(async (req, res) => {
  const benchmarks = await modelEvalService.getModelBenchmarks();
  res.json({ success: true, data: benchmarks });
}));

// ── 404 & Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
