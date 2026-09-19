import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { logger } from './src/utils/logger.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 ContentForge AI server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    logger.info(`👉 API Base: http://localhost:${env.PORT}/api/v1`);
  });

  const handleShutdown = (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((err) => {
  logger.error(`Fatal server startup error: ${err.message}`);
  process.exit(1);
});
