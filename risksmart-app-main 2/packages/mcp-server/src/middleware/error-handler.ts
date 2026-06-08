import type { Context } from 'hono';

import { McpError } from '../errors/mcp-error';
import tracer from '../utils/tracer';
import { getRequestLogger } from './request-context';

export const errorHandlerMiddleware = (err: Error, c: Context) => {
  const log = getRequestLogger(c);
  const span = tracer.scope().active();

  if (err instanceof McpError) {
    if (err.httpStatus >= 500) {
      log.error({ err, code: err.code, context: err.context }, err.message);

      // Tag the active span so Datadog Error Tracking picks up 5xx errors
      if (span) {
        span.setTag('error', true);
        span.setTag('error.message', err.message);
        span.setTag('error.type', err.code);
        span.setTag('error.stack', err.stack);
      }
    } else {
      log.warn({ code: err.code, context: err.context }, err.message);
    }

    return c.json(err.toMcpResponse(), err.httpStatus as never);
  }

  // Unhandled error — log full details, return generic message
  log.error({ err }, 'Unhandled error');

  if (span) {
    span.setTag('error', true);
    span.setTag('error.message', 'Unhandled internal error');
    span.setTag('error.type', 'unhandled_error');
    span.setTag('error.stack', err.stack);
  }

  return c.json(
    {
      error: 'internal_error',
      message: 'An unexpected error occurred. Please try again.',
    },
    500
  );
};
