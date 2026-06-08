import { randomUUID } from 'node:crypto';

import type { Context, Next } from 'hono';

import { logger, type RequestLogger } from '../utils/logger';
import { requestStore } from '../utils/request-store';

const REQUEST_LOGGER_KEY = 'requestLogger' as const;
const CORRELATION_ID_KEY = 'correlationId' as const;

export const requestContextMiddleware = async (c: Context, next: Next) => {
  const correlationId = randomUUID();
  const method = c.req.method;
  const path = c.req.path;

  const requestLogger = logger.child({
    correlationId,
    method,
    path,
  });

  c.set(CORRELATION_ID_KEY, correlationId);
  c.set(REQUEST_LOGGER_KEY, requestLogger);
  c.header('x-correlation-id', correlationId);

  requestLogger.info('Incoming request');

  const startTime = Date.now();

  await requestStore.run({ correlationId }, async () => {
    await next();
  });

  const duration = Date.now() - startTime;

  requestLogger.info({ status: c.res.status, duration }, 'Response sent');
};

/** Retrieve the request-scoped logger from Hono context. Falls back to global logger. */
export const getRequestLogger = (c: Context): RequestLogger =>
  (c.get(REQUEST_LOGGER_KEY) as RequestLogger) ?? logger;

/** Retrieve the correlation ID from Hono context. */
export const getCorrelationId = (c: Context): string | undefined =>
  c.get(CORRELATION_ID_KEY) as string | undefined;
