import {
  AuthenticationError,
  AuthorizationError,
  ExternalServiceError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '../errors';
import { getEnv } from '../utils/environment';
import { logger } from '../utils/logger';
import { requestStore } from '../utils/request-store';
import { FETCH_TIMEOUT_MS } from './constants';
import type { ToolExecutor } from './types';

const MAX_PAGES = 50;
/** Must match the external-api default page size (see list-request-query.middleware.ts). */
const MAX_PAGE_SIZE = 250;
const MAX_ERROR_MESSAGE_LENGTH = 200;
const MAX_LOG_BODY_LENGTH = 500;

// --- Endpoint mapping ---

interface RestEndpoint {
  /** URL path template with :param placeholders */
  path: string;
  /** Response type determines normalisation strategy */
  type: 'list' | 'item' | 'linked-items';
  /** Input params that have no REST query equivalent */
  unsupportedFilters?: string[];
}

export const endpointMap: Record<string, RestEndpoint> = {
  // Risks
  'frontend.risk.register': { path: '/api/v1/risks', type: 'list' },
  'frontend.risk.riskById': { path: '/api/v1/risks/:riskId', type: 'item' },

  // Controls
  'frontend.control.register': {
    path: '/api/v1/controls',
    type: 'list',
    unsupportedFilters: ['parentId'],
  },
  'frontend.control.controlById': {
    path: '/api/v1/controls/:controlId',
    type: 'item',
  },

  // Actions
  'frontend.action.register': {
    path: '/api/v1/actions',
    type: 'list',
    unsupportedFilters: ['parentId', 'tagTypeIds', 'departmentTypeIds'],
  },
  'frontend.action.actionById': { path: '/api/v1/actions/:id', type: 'item' },

  // Issues
  'frontend.issue.register': {
    path: '/api/v1/issues',
    type: 'list',
    unsupportedFilters: ['issueType', 'tagTypeIds', 'departmentTypeIds'],
  },
  'frontend.issue.issueById': { path: '/api/v1/issues/:id', type: 'item' },

  // Obligations
  'frontend.obligation.register': {
    path: '/api/v1/compliance/obligations',
    type: 'list',
  },

  // Third Parties
  'frontend.thirdParty.register': {
    path: '/api/v1/third-parties',
    type: 'list',
  },

  // Enterprise Risks
  'frontend.enterpriseRisk.register': {
    path: '/api/v1/enterprise-risks',
    type: 'list',
  },

  // Indicators
  'frontend.indicator.register': { path: '/api/v1/indicators', type: 'list' },

  // Documents (REST uses "policies", tRPC uses "documents")
  'frontend.document.register': { path: '/api/v1/policies', type: 'list' },

  // Assessments
  'frontend.assessment.register': {
    path: '/api/v1/assessments',
    type: 'list',
  },

  // Linked Items (entity-scoped in REST)
  'frontend.linkedItem.linkedItems': {
    path: '/api/v1/:entityType/:id/linked-items',
    type: 'linked-items',
  },
};

// --- URL builder ---

/**
 * Encode a path parameter value, preserving `/` separators for
 * multi-segment values like `compliance/obligations`.
 */
const encodePathParam = (value: string): string =>
  value.split('/').map(encodeURIComponent).join('/');

type BuildUrlResult = { ok: true; url: string } | { ok: false; error: string };

const buildRestUrl = (
  baseUrl: string,
  endpoint: RestEndpoint,
  input: Record<string, unknown>
): BuildUrlResult => {
  let path = endpoint.path;

  for (const [key, value] of Object.entries(input)) {
    if (value != null && path.includes(`:${key}`)) {
      path = path.replace(
        `:${key}`,
        encodePathParam(String(value as string | number))
      );
    }
  }

  // Guard: reject URLs with unresolved :param placeholders
  const unresolved = path.match(/:([a-zA-Z]+)/g);
  if (unresolved) {
    const missing = unresolved.map((p) => p.slice(1)).join(', ');

    return {
      ok: false,
      error: `Missing required parameter(s): ${missing}`,
    };
  }

  if (endpoint.type === 'list' || endpoint.type === 'linked-items') {
    path += `?page_size=${MAX_PAGE_SIZE}`;
  }

  return { ok: true, url: `${baseUrl}${path}` };
};

// --- Error handling ---

class RestApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string
  ) {
    super(`REST API error: ${status} ${statusText}`);
    this.name = 'RestApiError';
  }
}

const formatRestError = (status: number, body: string): string => {
  let message: string;
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string };
      message?: string;
    };
    message = parsed.error?.message ?? parsed.message ?? 'Unknown error';
  } catch {
    message = body || 'Unknown error';
  }

  // Truncate to prevent leaking internal details (stack traces, internal URLs)
  return message.slice(0, MAX_ERROR_MESSAGE_LENGTH);
};

/**
 * Map a REST API error to the appropriate typed exception.
 */
const throwRestApiError = (error: RestApiError): never => {
  const userMessage = formatRestError(error.status, error.body);

  logger.error({ status: error.status }, 'REST API call failed');
  logger.debug(
    {
      status: error.status,
      body: error.body.slice(0, MAX_LOG_BODY_LENGTH),
    },
    'REST API error response body'
  );

  switch (error.status) {
    case 400:
      throw new ValidationError(`Invalid request: ${userMessage}`);
    case 401:
      throw new AuthenticationError(
        'Authentication failed. The API credentials may be invalid or expired.'
      );
    case 403:
      throw new AuthorizationError(
        'Access denied. The API credentials do not have permission to access this resource.'
      );
    case 404:
      throw new NotFoundError(`Not found: ${userMessage}`);
    case 429:
      throw new RateLimitError('Rate limit exceeded. Please try again later.');
    default:
      throw new ExternalServiceError(
        'External API',
        `Error (${error.status}): ${userMessage}`
      );
  }
};

// --- Pagination ---

/** Subset of external-api QueryMetaDataResponse used for pagination. */
interface ListResponse {
  data: unknown[];
  pageInfo: {
    nextPage: string | null;
    hasMore: boolean;
  };
}

/**
 * Resolve a nextPage URL, validating it stays within the expected origin.
 * Prevents SSRF if the API response is tampered with or misconfigured.
 */
const resolveNextPageUrl = (
  baseUrl: string,
  nextPage: string
): string | null => {
  try {
    const resolved = new URL(nextPage, baseUrl);
    const base = new URL(baseUrl);
    if (resolved.origin !== base.origin) {
      logger.warn(
        { nextPage, resolved: resolved.href },
        'nextPage points to external origin — stopping pagination'
      );

      return null;
    }

    return resolved.href;
  } catch {
    logger.warn({ nextPage }, 'Invalid nextPage URL — stopping pagination');

    return null;
  }
};

const fetchAllPages = async (
  initialUrl: string,
  headers: Record<string, string>,
  baseUrl: string,
  toolName: string
): Promise<unknown[]> => {
  const allItems: unknown[] = [];
  let url: string | null = initialUrl;
  let pageCount = 0;

  while (url && pageCount < MAX_PAGES) {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throwRestApiError(
        new RestApiError(response.status, response.statusText, errorText)
      );
    }

    const body = (await response.json()) as ListResponse;
    allItems.push(...body.data);
    pageCount++;

    url = body.pageInfo.nextPage
      ? resolveNextPageUrl(baseUrl, body.pageInfo.nextPage)
      : null;
  }

  if (pageCount >= MAX_PAGES) {
    logger.warn(
      { tool: toolName, pageCount, totalItems: allItems.length },
      'Reached maximum page limit — results may be incomplete'
    );
  }

  logger.debug(
    { tool: toolName, pageCount, totalItems: allItems.length },
    'Pagination complete'
  );

  return allItems;
};

// --- Main executor ---

export const executeRestTool: ToolExecutor = async (
  toolDef,
  input,
  session
) => {
  const restBaseUrl = getEnv('EXTERNAL_API_BASE_URL');
  const endpoint = endpointMap[toolDef.procedurePath];

  if (!endpoint) {
    throw new AuthorizationError(
      `No REST endpoint mapping for "${toolDef.name}" (${toolDef.procedurePath}). This tool may only be available via OAuth authentication.`
    );
  }

  // Validate entityType for linked-items endpoint
  if (endpoint.type === 'linked-items' && !input.entityType) {
    throw new ValidationError(
      'The "entityType" parameter is required when using API key authentication. ' +
        'Specify the type of item (e.g. "risks", "controls", "actions", "issues", "indicators", "policies", "compliance/obligations", "third-parties").',
      { parameter: 'entityType' }
    );
  }

  // Log unsupported filters
  if (endpoint.unsupportedFilters) {
    const appliedUnsupported = endpoint.unsupportedFilters.filter(
      (f) => input[f] != null
    );
    if (appliedUnsupported.length > 0) {
      logger.warn(
        { tool: toolDef.name, filters: appliedUnsupported },
        'Unsupported filters ignored on REST path'
      );
    }
  }

  const urlResult = buildRestUrl(restBaseUrl, endpoint, input);
  if (!urlResult.ok) {
    throw new ValidationError(urlResult.error);
  }

  const correlationId = requestStore.getStore()?.correlationId;
  const headers: Record<string, string> = {
    authorization: `Bearer ${session.accessToken}`,
    accept: 'application/json',
    ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
  };

  logger.info(
    { tool: toolDef.name, endpoint: endpoint.path, type: endpoint.type },
    'Executing MCP tool via REST API'
  );

  if (endpoint.type === 'list' || endpoint.type === 'linked-items') {
    const items = await fetchAllPages(
      urlResult.url,
      headers,
      restBaseUrl,
      toolDef.name
    );

    return JSON.stringify(items, null, 2);
  }

  // Single-item fetch
  const response = await fetch(urlResult.url, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throwRestApiError(
      new RestApiError(response.status, response.statusText, errorText)
    );
  }

  const data = await response.json();

  // Wrap single item in array to match tRPC executor output format
  return JSON.stringify([data], null, 2);
};
