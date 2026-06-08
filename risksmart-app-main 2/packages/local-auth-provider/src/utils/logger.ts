import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    pid: false,
    hostname: false,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type Logger = typeof logger;

export interface RequestMetadata {
  requestId: string;
  tenantId?: string;
  userId?: string;
  method: string;
  path: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
}

export function createRequestLogger(metadata: RequestMetadata) {
  return logger.child({
    requestId: metadata.requestId,
    tenantId: metadata.tenantId,
    userId: metadata.userId,
    method: metadata.method,
    path: metadata.path,
    userAgent: metadata.userAgent,
    ip: metadata.ip,
    timestamp: metadata.timestamp,
  });
}

export function generateRequestId(): string {
  return uuidv4();
}

export function logStartup(config: { port: number; env: string }) {
  logger.info(
    {
      event: 'startup',
      port: config.port,
      env: config.env,
      timestamp: new Date().toISOString(),
    },
    'Local auth provider server starting'
  );
}

export function logRequestStart(metadata: RequestMetadata) {
  const requestLogger = createRequestLogger(metadata);
  requestLogger.info(
    {
      event: 'request_start',
    },
    `${metadata.method} ${metadata.path}`
  );

  return requestLogger;
}

export function logRequestEnd(
  requestLogger: pino.Logger,
  statusCode: number,
  duration: number,
  error?: Error
) {
  const logData = {
    event: 'request_end',
    statusCode,
    duration,
    error: error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : undefined,
  };

  if (error || statusCode >= 500) {
    requestLogger.error(logData, 'Request completed with error');
  } else if (statusCode >= 400) {
    requestLogger.warn(logData, 'Request completed with client error');
  } else {
    requestLogger.info(logData, 'Request completed successfully');
  }
}
