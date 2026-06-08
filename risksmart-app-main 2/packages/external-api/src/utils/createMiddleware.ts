import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import type { ParsedQs } from 'qs';

import type {
  AppRequest,
  AuthenticatedRequest,
  PublicRequest,
} from '../types/request';

export function createMiddleware<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  middleware: (
    req: AuthenticatedRequest<Params, ReqBody, ResBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => void | Promise<void>
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> {
  return (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res,
    next
  ): ReturnType<typeof middleware> => {
    const typedReq = req as AuthenticatedRequest<
      Params,
      ReqBody,
      ResBody,
      ReqQuery
    >;

    return middleware(typedReq, res, next);
  };
}

export function createPublicMiddleware<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  middleware: (
    req: PublicRequest<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody, { cspNonce?: string }>,
    next: NextFunction
  ) => void
): RequestHandler<Params, ResBody, ReqBody, ReqQuery, { cspNonce?: string }> {
  return (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res,
    next
  ): void => {
    const typedReq = req as PublicRequest<Params, ResBody, ReqBody, ReqQuery>;

    return middleware(typedReq, res, next);
  };
}

export function createErrorMiddleware<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  handler: (
    err: Error,
    req: AppRequest<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => void
): ErrorRequestHandler<Params, ResBody, ReqBody, ReqQuery> {
  return (
    err: Error,
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => {
    const typedReq = req as AppRequest<Params, ResBody, ReqBody, ReqQuery>;

    return handler(err, typedReq, res, next);
  };
}
