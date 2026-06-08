import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

import tracer from './tracer';

const isDevelopment = process.env.NODE_ENV === 'development';

interface DatadogIds {
  'dd.trace_id'?: string;
  'dd.span_id'?: string;
}

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
    service: process.env.DD_SERVICE || 'external-api',
    env: process.env.DD_ENV || 'development',
    version: process.env.DD_VERSION || 'unknown',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin(): DatadogIds {
    const span = tracer.scope().active();
    if (!span) {
      return {};
    }

    const ctx = span.context();

    return {
      'dd.trace_id': ctx.toTraceId(),
      'dd.span_id': ctx.toSpanId(),
    };
  },
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

export function logStartup(config: {
  port: number;
  env: string;
  appEnv: string;
}) {
  logger.info(
    {
      event: 'startup',
      ...config,
      timestamp: new Date().toISOString(),
    },
    'External API server starting'
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

export interface TimerMetadata {
  [key: string]: unknown;
}

interface TimerInstance {
  timerId: string;
  startTime: number;
  timeoutHandle: NodeJS.Timeout;
  logger: pino.Logger;
  message: string;
  metadata: TimerMetadata;
}

const activeTimers = new Map<string, TimerInstance>();

export interface TimerHandle {
  timerId: string;
  end: (finalMetadata?: TimerMetadata) => void;
  cancel: () => void;
}

export function createTimer(
  message: string,
  metadata: TimerMetadata = {},
  timeoutMs: number = 30000,
  timerLogger: pino.Logger = logger
): TimerHandle {
  const timerId = uuidv4();
  const startTime = Date.now();

  const timeoutHandle = setTimeout(() => {
    const timer = activeTimers.get(timerId);
    if (timer) {
      const elapsedTime = Date.now() - timer.startTime;
      timer.logger.warn(
        {
          event: 'timer_timeout',
          timerId,
          startTime: timer.startTime,
          endTime: Date.now(),
          elapsedTime,
          timeoutMs,
          ...timer.metadata,
        },
        `Timer timeout: ${timer.message}`
      );
      activeTimers.delete(timerId);
    }
  }, timeoutMs);

  const timerInstance: TimerInstance = {
    timerId,
    startTime,
    timeoutHandle,
    logger: timerLogger,
    message,
    metadata,
  };

  activeTimers.set(timerId, timerInstance);

  return {
    timerId,
    end: (finalMetadata: TimerMetadata = {}) => {
      const timer = activeTimers.get(timerId);
      if (timer) {
        clearTimeout(timer.timeoutHandle);
        const endTime = Date.now();
        const elapsedTime = endTime - timer.startTime;

        timer.logger.info(
          {
            event: 'timer_completed',
            timerId,
            startTime: timer.startTime,
            endTime,
            elapsedTime,
            ...timer.metadata,
            ...finalMetadata,
          },
          `Timer completed: ${timer.message}`
        );
        activeTimers.delete(timerId);
      }
    },
    cancel: () => {
      const timer = activeTimers.get(timerId);
      if (timer) {
        clearTimeout(timer.timeoutHandle);
        timer.logger.info(
          {
            event: 'timer_cancelled',
            timerId,
            startTime: timer.startTime,
            endTime: Date.now(),
            elapsedTime: Date.now() - timer.startTime,
            ...timer.metadata,
          },
          `Timer cancelled: ${timer.message}`
        );
        activeTimers.delete(timerId);
      }
    },
  };
}

export function getActiveTimersCount(): number {
  return activeTimers.size;
}

export function cancelAllTimers(): void {
  for (const timer of activeTimers.values()) {
    clearTimeout(timer.timeoutHandle);
    timer.logger.info(
      {
        event: 'timer_force_cancelled',
        timerId: timer.timerId,
        startTime: timer.startTime,
        endTime: Date.now(),
        elapsedTime: Date.now() - timer.startTime,
        ...timer.metadata,
      },
      `Timer force cancelled: ${timer.message}`
    );
  }
  activeTimers.clear();
}
