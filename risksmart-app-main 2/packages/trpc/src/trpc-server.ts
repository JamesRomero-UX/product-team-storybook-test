import { dbHealthChecks } from '@risksmart-app/drizzle/src/db-healthchecks';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import compression from 'compression';
import cors from 'cors';
import type { Request } from 'express';
import express from 'express';
import { expressjwt } from 'express-jwt';
import helmet from 'helmet';
import type { Server } from 'http';
import pino from 'pino-http';

import { createContext } from './context';
import { appRouter } from './routers/router';
import { getEnv } from './utils/environment';
import { createExpressJWT, parseJWTConfig } from './utils/jwt';
import { logger } from './utils/logger';

export type AppRouter = typeof appRouter;
const jwtSecretConfigString = getEnv('JWT_SECRET_CONFIG');

export const createTRPCServer = (isLocal: boolean): Promise<Server> => {
  return new Promise((resolve) => {
    const jwtConfig = parseJWTConfig(jwtSecretConfigString);
    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(
      compression({
        // Compression level (0-9), 6 is the default
        level: 6,
        // Don't compress responses smaller than this
        threshold: 1024, // 1KB
        // Only compress for these MIME types
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }

          return compression.filter(req, res);
        },
      })
    );
    app.use(
      pino({
        logger,
        autoLogging: {
          ignore: (req: Request) =>
            req.url === '/healthz' &&
            (req.method === 'GET' || req.method === 'HEAD') &&
            req.res?.statusCode === 200,
        },
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          remove: true,
        },
      })
    );
    const jwtParams = createExpressJWT(jwtConfig);

    app.use(
      expressjwt(jwtParams).unless({
        path: isLocal ? ['/healthz', '/sync'] : ['/healthz'],
      })
    );

    app.use(
      '/trpc',
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );

    app.get('/healthz', async function (_req, res) {
      const result = await dbHealthChecks();
      for (const [tenant, healthy] of Object.entries(result)) {
        if (!healthy) {
          logger.error({ tenant }, 'Database health check failed for tenant');
        }
      }
      res.send('I am healthy\n');
    });

    const trpcServer = app.listen(2021, () => {
      logger.info('TRPC listening on port 2021');
      resolve(trpcServer);
    });
    trpcServer.setTimeout(0);
  });
};
