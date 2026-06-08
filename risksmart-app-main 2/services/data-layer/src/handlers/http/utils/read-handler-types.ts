import type { Context as LambdaContext } from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import type { PaginationParams } from 'src/utils/pagination';
import type z from 'zod';

/**
 * Configuration for permission filtering applied post-fetch
 */
export interface PermissionFilterConfig<TData> {
  /**
   * The Permit.io resource type to check permissions against
   * e.g., 'rs_node', 'action', etc.
   */
  resourceType: string;

  /**
   * Function to extract the object ID from a data item for permission checks
   */
  idExtractor: (object: TData) => string;

  /**
   * When true, throws 403 Forbidden if filtering removes all items
   * (indicates the item existed but the user lacks permission)
   */
  isSingleItemResult?: boolean;
}

/**
 * Context passed to the read handler function
 */
export interface ReadHandlerContext<
  TPathParams = Record<string, string | undefined>,
  TQueryParams = Record<string, string | undefined>,
> {
  /**
   * Validated path parameters (if withPathParamsSchema was called)
   */
  pathParams: TPathParams;

  /**
   * Validated query parameters (if withQueryParamsSchema was called)
   */
  queryParams: TQueryParams;

  /**
   * Service context extracted from headers (tenant, orgKey, userId)
   */
  serviceContext: ServiceContext;

  /**
   * Pagination parameters (if withPagination was called)
   */
  pagination?: PaginationParams;
}

/**
 * Lambda context enriched with service context during middleware processing
 */
export interface EnrichedReadLambdaContext extends LambdaContext {
  serviceContext?: ServiceContext;
  pathParams?: Record<string, string | undefined>;
  queryParams?: Record<string, string | undefined>;
  pagination?: PaginationParams;
}

/**
 * Lambda context with all required fields validated
 */
export interface ValidatedReadLambdaContext<
  TPathParams = Record<string, string | undefined>,
  TQueryParams = Record<string, string | undefined>,
> extends LambdaContext {
  serviceContext: ServiceContext;
  pathParams: TPathParams;
  queryParams: TQueryParams;
  pagination?: PaginationParams;
  /**
   * Data from the handler, potentially modified by middleware (e.g. permission filtering)
   */
  data?: unknown[];
  /**
   * Object name for error messages and logging
   */
  objectName?: string;
}

/**
 * Configuration for an all-or-nothing bulk permission check applied before
 * the handler executes. If none of the checks pass, the handler is skipped
 * and an empty result is returned.
 */
export interface BulkPermissionCheckConfig {
  /**
   * The permission checks to evaluate. All checks are passed to Permit.io's
   * bulkCheck API. If the result is empty (none granted), the handler is
   * short-circuited and an empty array is returned.
   */
  checks: {
    resourceName: string;
    resourceId?: string;
    action: 'read' | 'delete' | 'insert' | 'update';
  }[];
}

/**
 * Inferred types from Zod schemas
 */
export type InferSchemaType<T> = T extends z.ZodSchema ? z.infer<T> : undefined;

/**
 * Type for the handler function that fetches data
 */
export type ReadHandlerFn<TPathParams, TQueryParams, TData> = (
  context: ReadHandlerContext<TPathParams, TQueryParams>
) => Promise<TData | TData[] | null>;
