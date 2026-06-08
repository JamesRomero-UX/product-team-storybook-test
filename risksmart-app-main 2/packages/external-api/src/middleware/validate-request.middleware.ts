import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import type { ParsedQs } from 'qs';
import type { ZodType } from 'zod';

import { createMiddleware } from '../utils/createMiddleware';
import { serializeZodError } from '../utils/schemas';

interface ValidateRequestSchemas {
  body?: ZodType<unknown>;
  params?: ZodType<Record<string, string>>;
  query?: ZodType<ParsedQs>;
}

// Middleware that validates request body, params, and/or query against Zod schemas.
export const validateRequest = (
  schemas: ValidateRequestSchemas
): RequestHandler =>
  createMiddleware((req, res, next) => {
    const errors: {
      location: string;
      detail: ReturnType<typeof serializeZodError>;
    }[] = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push({
          location: 'params',
          detail: serializeZodError(result.error),
        });
      } else {
        req.params = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push({
          location: 'query',
          detail: serializeZodError(result.error),
        });
      } else {
        req.query = result.data;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push({
          location: 'body',
          detail: serializeZodError(result.error),
        });
      } else {
        req.body = result.data;
      }
    }

    if (errors.length > 0) {
      req.requestLogger.warn(
        { event: 'request_validation_failed', errors },
        'Request validation failed'
      );
      throw createHttpError(400, 'Validation failed', { errors });
    }

    next();
  });
