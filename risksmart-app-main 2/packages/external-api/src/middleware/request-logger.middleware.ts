import { createMiddleware } from '../utils/createMiddleware';
import {
  generateRequestId,
  logRequestEnd,
  logRequestStart,
} from '../utils/logger';
import { API_VERSION_HEADER } from './api-version.middleware';

// TODO: move this process.env out and instead build mw with app config.
const isDevelopment = process.env.NODE_ENV === 'development';

export const requestLoggerMiddleware = createMiddleware((req, res, next) => {
  // ignore health check endpoint if in production.
  if (isDevelopment === false && req.path === '/healthz') {
    return next();
  }
  const startTime = Date.now();
  const requestId =
    (req.headers['x-request-id'] as string) || generateRequestId();

  const metadata = {
    requestId,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'],
    requestedVersion:
      req.headers[API_VERSION_HEADER.toLocaleLowerCase()] ?? 'none',
    ip: req.ip || req.socket.remoteAddress,
    timestamp: new Date().toISOString(),
  };

  const requestLogger = logRequestStart(metadata);

  req.requestId = requestId;
  req.requestLogger = requestLogger;
  req.startTime = startTime;

  // Set request ID in response header
  res.setHeader('x-request-id', requestId);

  // Log when response finishes
  const originalEnd = res.end;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function (chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    logRequestEnd(requestLogger, res.statusCode, duration);

    return originalEnd.call(this, chunk, encoding);
  };

  next();
});
