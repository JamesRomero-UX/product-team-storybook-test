import 'dotenv/config';

import { createTRPCServer } from './trpc-server';
import { getEnvBoolean } from './utils/environment';
import { logger } from './utils/logger';

const isLocal = getEnvBoolean('IS_LOCAL', true);

async function main() {
  try {
    logger.info('Starting servers...');
    const [trpcServer] = await Promise.all([createTRPCServer(isLocal)]);
    logger.info('All servers started successfully.');

    const shutdown = () => {
      logger.info('SIGTERM received, shutting down servers...');
      trpcServer.close(() => {
        logger.info('TRPC server closed');
      });
    };

    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed to start servers');
    process.exit(1);
  }
}

void main();
