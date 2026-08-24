import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';
import logger from './config/logger';

async function bootstrap() {
  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 KnowVerse backend running on http://localhost:${env.PORT}`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   Frontend URL: ${env.FRONTEND_URL}`);
    logger.info(`   AI Service:   ${env.AI_SERVICE_URL}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed');
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });
}

bootstrap();
