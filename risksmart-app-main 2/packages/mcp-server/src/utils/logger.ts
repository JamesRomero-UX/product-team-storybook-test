import pino from 'pino';

import tracer from './tracer';

interface DatadogIds {
  'dd.trace_id'?: string;
  'dd.span_id'?: string;
}

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    service: process.env.DD_SERVICE || 'mcp-server',
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

export type RequestLogger = pino.Logger;
