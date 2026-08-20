import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, prisma } from './config/db';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = createApp();

  // Attempt database connection
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 LinkLite Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`🔗 Base Short URL: ${env.BASE_URL}`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('HTTP server and Database connections closed.');
      process.exit(0);
    });

    // Force shutdown if taking longer than 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
