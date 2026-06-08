import type {
  NextFunction,
  Request as ExpressRequest,
  Response,
} from 'express';
import type { JwtPayload } from 'jwt-decode';
import type { ParsedQs } from 'qs';

import type { QueryCursor } from '../schemas/route-query.schema';
import type { logRequestStart } from '../utils/logger';
import type { Compat } from './versioning';

interface JWTCustomClaims {
  org_id?: string;
  tenant_id?: string;
  scope?: string;
  readonly rl_profile?: string;
  readonly client_id?: string;
  readonly compat_version?: string;
  readonly role?: 'rs-external' | 'rs-internal';
  readonly permissions?: string;
  readonly 'https://hasura.io/jwt/claims'?: {
    'x-hasura-user-id'?: string;
    'x-hasura-org-id'?: string;
    'x-hasura-tenant-name'?: string;
    'x-hasura-allowed-roles'?: string[];
  };
}

export interface AppRequest<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
> extends ExpressRequest<Params, ResBody, ReqBody, ReqQuery> {
  requestLogger: ReturnType<typeof logRequestStart>;
}

export interface RequestListOptions {
  beforeCursor: QueryCursor | null;
  afterCursor: QueryCursor | null;
  pageSize: number;
}

export type PublicRequest<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
> = AppRequest<Params, ResBody, ReqBody, ReqQuery>;

export interface AuthenticatedRequest<
  Params extends Record<string, string> = Record<string, string>,
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
  TAuth = JwtPayload & JWTCustomClaims,
> extends AppRequest<Params, ResBody, ReqBody, ReqQuery> {
  auth?: TAuth;
  requestId: string;
  tenantId?: string;
  orgId?: string;
  userId?: string;
  user?: JwtPayload;
  scope?: string[];
  startTime: number;
  listQueryOptions?: RequestListOptions;
  apiVersion: Compat;
  readonly permissions?: string;
  readonly role?: 'rs-external' | 'rs-internal';
}

export type HandlerWithAuth<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
> = (
  req: AuthenticatedRequest<Params, ReqBody, ResBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void> | void;
