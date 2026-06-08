import type {
  FormConfigResponse,
  IAuthClient,
  IClient,
} from '../clients/client.interface';

export interface ServiceConfig {
  basePath: string;
}

interface QueryFilters {
  ids?: string[];
}

export interface SeqIdQueryOpts {
  beforeId: number | null;
  afterId: number | null;
  limit: number | null;
}

export interface IdDateTimeQueryOpts {
  beforeId: string | null;
  beforeDateTime: string | null;
  afterId: string | null;
  afterDateTime: string | null;
  limit: number | null;
  filters?: QueryFilters;
}

export interface Metadata {
  nextId: number | string | null;
  prevId: number | string | null;
  hasNext: boolean;
  hasPrev: boolean;
  count: number;
}

export interface DateTimeUuidMetadata extends Metadata {
  nextDateTime: string;
  prevDateTime: string;
}

export interface ServiceCallContext {
  authToken: string;
  expandedFields?: string[];
  orgId?: string;
  tenantId?: string;
}

export type Service<C extends IClient | IAuthClient> = (
  client: C,
  config: ServiceConfig
) => Record<string, (...args: never[]) => Promise<unknown>>;

export type ServiceWithProps<P, C extends ServiceConfig> = (
  props: P,
  config: C
) => Record<string, (...args: never[]) => Promise<unknown>>;

export interface Result<T> {
  readonly metadata: Metadata;
  readonly data: T;
}

export interface EntityResult<T> {
  readonly form_configuration?: FormConfigResponse | null;
  readonly data: T;
}

export type ListQueryFetchFn<T> = (
  query: Readonly<SeqIdQueryOpts>,
  ctx: Readonly<ServiceCallContext>
) => Promise<Result<T>>;

export type LinkedListQueryFetchFn<T> = (
  linkId: string,
  query: Readonly<SeqIdQueryOpts>,
  ctx: Readonly<ServiceCallContext>
) => Promise<Result<T>>;

export type ListDateTimeQueryFetchFn<T> = (
  query: Readonly<IdDateTimeQueryOpts>,
  ctx: Readonly<ServiceCallContext>
) => Promise<Result<T>>;

export type LinkedListIdDateTimeQueryFetchFn<T> = (
  linkId: string,
  query: Readonly<IdDateTimeQueryOpts>,
  ctx: Readonly<ServiceCallContext>
) => Promise<Result<T>>;

export type LinkedByIdQueryFetchFn<T> = (
  ids: Record<string, string>,
  ctx: Readonly<ServiceCallContext>
) => Promise<EntityResult<T> | null>;

export type ByIdQueryFetchFn<T> = (
  id: string,
  ctx: Readonly<ServiceCallContext>
) => Promise<EntityResult<T> | null>;
