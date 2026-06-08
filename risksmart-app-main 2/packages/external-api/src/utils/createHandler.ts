import {
  BrokenCircuitError,
  BulkheadRejectedError,
  IsolatedCircuitError,
} from 'cockatiel';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import createHttpError from 'http-errors';
import type { ParsedQs } from 'qs';
import { ZodError } from 'zod';

import type { AuthProps } from '../auth/route-wrapper.auth';
import { createAuthMiddleware } from '../auth/route-wrapper.auth';
import {
  AppClientAlreadyExistsError,
  AppClientNotFoundError,
  ClientLimitError,
  InvalidAppClientScopesError,
} from '../errors/app-client.errors';
import { InvalidAuthTokenRequestError } from '../errors/auth.errors';
import type {
  AppRequest,
  HandlerWithAuth,
  PublicRequest,
} from '../types/request';
import { logger } from './logger';

export function createAsyncAuthedHandler<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  authProps: AuthProps,
  handler: HandlerWithAuth<Params, ReqBody, ResBody, ReqQuery>
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> {
  const authMiddleware = createAuthMiddleware<
    Params,
    ReqBody,
    ResBody,
    ReqQuery
  >(authProps, handler);
  if (!authProps.requiredScopes?.length && !authProps.extraCheck) {
    throw new Error(
      'Missing required scopes or extra check for authed route handler'
    );
  }

  return async (req, res, next) => {
    try {
      await authMiddleware(req, res, next);
    } catch (err) {
      handleError(err, res, next, req);
    }
  };
}

export function createAsyncPublicHandler<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  handler: (
    req: AppRequest<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<void>
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> {
  return async (req, res, next) => {
    try {
      const typedReq = req as AppRequest<Params, ResBody, ReqBody, ReqQuery>;
      await handler(typedReq, res, next);
    } catch (err) {
      handleError(err, res, next, req);
    }
  };
}

export function createPublicHandler<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  handler: (
    req: PublicRequest<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody, { cspNonce?: string }>,
    next: NextFunction
  ) => void
): RequestHandler<Params, ResBody, ReqBody, ReqQuery, { cspNonce?: string }> {
  return (req, res, next) => {
    try {
      const typedReq = req as PublicRequest<Params, ResBody, ReqBody, ReqQuery>;
      handler(typedReq, res, next);
    } catch (err) {
      handleError(err, res, next, req);
    }
  };
}

function handleError(
  err: unknown,
  res: Response,
  next: NextFunction,
  req: Request
) {
  // validation errors
  if (err instanceof ZodError && req.method.toLowerCase() === 'get') {
    return next(createHttpError(400, 'Invalid request query parameters'));
  }

  // App errors
  if (err instanceof InvalidAuthTokenRequestError) {
    return next(createHttpError(400, 'Invalid credentials for token request'));
  }
  if (err instanceof ClientLimitError) {
    return next(
      createHttpError(
        409,
        'Maximum client credentials limit reached for this organization'
      )
    );
  }
  if (err instanceof AppClientAlreadyExistsError) {
    return next(
      createHttpError(
        409,
        'A client with this name already exists in the organization'
      )
    );
  }
  if (err instanceof AppClientNotFoundError) {
    return next(createHttpError(401, 'Credentials not active'));
  }
  if (err instanceof InvalidAppClientScopesError) {
    return next(
      createHttpError(400, 'Invalid scopes provided for this client')
    );
  }

  // Breaker errors
  if (err instanceof IsolatedCircuitError) {
    // isolated errors are for manual overrides (kill-switch open).
    logger.warn(
      { event: 'manual_circuit_breaker_open' },
      'Breaker manually forced open'
    );
    res.setHeader('Retry-After', 60);

    return next(createHttpError(503, 'Service temporarily unavailable'));
  }
  if (err instanceof BrokenCircuitError) {
    logger.warn({ event: 'circuit_breaker_open' }, 'Breaker is open');
    res.setHeader('Retry-After', 60);

    return next(createHttpError(503, 'Service temporarily unavailable'));
  }
  if (err instanceof BulkheadRejectedError) {
    logger.warn({ event: 'bulkhead_rejected' }, 'Too many requests');

    return next(
      createHttpError(429, 'Too many requests, please try again later')
    );
  }
  next(err);
}
