import axios, { AxiosError } from 'axios';

import { logger } from '../utils/logger';
import type { CachedSsmParameter } from '../utils/ssm-parameter-client';
import {
  type ApiRequestContext,
  createCachedSsmParameter,
  getRequestHeaders,
  getUrlFromSsmParam,
} from './client-utils';

// Lazy-initialized SSM parameter client — defers SSM call until first use
let requestStateUrlParam: CachedSsmParameter | null = null;

/**
 * Request state task status enum - mirrors the backend enum
 */
export enum RequestStateTaskStatus {
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

/**
 * Response from initiating an async request
 */
export interface InitiateRequestResponse {
  correlationId: string;
  status: RequestStateTaskStatus;
}

/**
 * Response from getting request state
 */
export interface RequestStateResponse {
  correlationId: string;
  status: RequestStateTaskStatus;
  response?: unknown;
  error?: unknown;
}

/**
 * Simplified request body for initiating an async request
 */
export interface InitiateRequestBody {
  type: string;
  request: Record<string, unknown>;
}

/**
 * Options for polling until complete
 */
export interface PollOptions {
  /** Initial delay between polls in ms (default: 500) */
  initialDelayMs?: number;
  /** Maximum delay between polls in ms (default: 2000) */
  maxDelayMs?: number;
  /** Maximum total time to wait in ms (default: 30000) */
  timeoutMs?: number;
  /** Backoff multiplier (default: 1.5) */
  backoffMultiplier?: number;
}

const DEFAULT_POLL_OPTIONS: Required<PollOptions> = {
  initialDelayMs: 100,
  maxDelayMs: 1000,
  timeoutMs: 30000,
  backoffMultiplier: 1.2,
};

/**
 * Gets the request state API URL from SSM Parameter Store.
 * In local dev, the SSM mock (scripts/local-mocks/ssm-mock.js) serves
 * the URL via AWS_ENDPOINT_URL_SSM.
 */
async function getRequestStateApiUrl(): Promise<string> {
  if (!requestStateUrlParam) {
    requestStateUrlParam = createCachedSsmParameter(
      'REQUEST_STATE_API_URL_SSM_PARAM'
    );
  }

  return await getUrlFromSsmParam(requestStateUrlParam);
}

/**
 * Initiates an async request via the Request State API
 *
 * @param context - API request context containing tenant, orgKey, and userId
 * @param correlationId - UUID for tracking the request
 * @param body - Request body containing type and request payload
 * @returns Response with correlationId and PENDING status
 */
export async function initiateAsyncRequest(
  context: ApiRequestContext,
  correlationId: string,
  body: InitiateRequestBody
): Promise<{ data: InitiateRequestResponse; status: number }> {
  const { tenant, orgKey, userId } = context;
  const baseUrl = await getRequestStateApiUrl();
  const url = `${baseUrl}/request`;

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant': tenant,
    'x-org-key': orgKey,
    'x-user-id': userId,
    'x-correlation-id': correlationId,
    'x-domain': 'risksmart',
    'x-service': 'trpc-api',
  };

  const bodyString = JSON.stringify(body);
  const headers = await getRequestHeaders(url, 'POST', baseHeaders, bodyString);

  logger.info(
    { url, correlationId, requestType: body.type },
    'Initiating async request'
  );

  try {
    const response = await axios.post<InitiateRequestResponse>(url, body, {
      headers,
    });

    logger.info(
      { correlationId, status: response.status },
      'Async request initiated successfully'
    );

    return { data: response.data, status: response.status };
  } catch (error) {
    if (error instanceof AxiosError) {
      logger.error(
        {
          url,
          status: error.response?.status,
          error: error.response?.data as unknown,
          correlationId,
        },
        'Failed to initiate async request'
      );

      // Return the error response for the caller to handle
      if (error.response) {
        return {
          data: error.response.data as InitiateRequestResponse,
          status: error.response.status,
        };
      }
    }

    throw error;
  }
}

/**
 * Gets the current state of an async request
 *
 * @param tenant - Tenant identifier
 * @param correlationId - UUID of the request to check
 * @returns Current request state including status and response/error data
 */
export async function getRequestState(
  tenant: string,
  correlationId: string
): Promise<{ data: RequestStateResponse; status: number }> {
  const baseUrl = await getRequestStateApiUrl();
  const url = `${baseUrl}/request/${correlationId}`;

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant': tenant,
  };

  const headers = await getRequestHeaders(url, 'GET', baseHeaders);

  logger.debug({ url, correlationId }, 'Getting request state');

  try {
    const response = await axios.get<RequestStateResponse>(url, { headers });

    return { data: response.data, status: response.status };
  } catch (error) {
    if (error instanceof AxiosError) {
      logger.error(
        {
          url,
          status: error.response?.status,
          error: error.response?.data as unknown,
          correlationId,
        },
        'Failed to get request state'
      );

      // Return the error response for the caller to handle
      if (error.response) {
        return {
          data: error.response.data as RequestStateResponse,
          status: error.response.status,
        };
      }
    }

    throw error;
  }
}

/**
 * Polls the request state API until the request completes or fails
 *
 * @param tenant - Tenant identifier
 * @param correlationId - UUID of the request to poll
 * @param options - Polling configuration options
 * @returns Final request state when complete or failed
 * @throws Error if polling times out
 */
export async function pollUntilComplete(
  tenant: string,
  correlationId: string,
  options?: PollOptions
): Promise<RequestStateResponse> {
  const { initialDelayMs, maxDelayMs, timeoutMs, backoffMultiplier } = {
    ...DEFAULT_POLL_OPTIONS,
    ...options,
  };

  const startTime = Date.now();
  let currentDelay = initialDelayMs;

  logger.info(
    { correlationId, timeoutMs, initialDelayMs },
    'Starting to poll for request completion'
  );

  while (Date.now() - startTime < timeoutMs) {
    const { data, status } = await getRequestState(tenant, correlationId);

    if (status !== 200) {
      logger.warn(
        { correlationId, status },
        'Non-200 status when polling request state'
      );
      // Continue polling - might be a transient error
    }

    if (
      data.status === RequestStateTaskStatus.COMPLETE ||
      data.status === RequestStateTaskStatus.FAILED
    ) {
      logger.info(
        {
          correlationId,
          status: data.status,
          elapsedMs: Date.now() - startTime,
        },
        'Request completed'
      );

      return data;
    }

    // Wait before next poll with exponential backoff
    await new Promise((resolve) => setTimeout(resolve, currentDelay));
    currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
  }

  const error = new Error(
    `Polling timeout: request ${correlationId} did not complete within ${timeoutMs}ms`
  );
  logger.error({ correlationId, timeoutMs }, error.message);
  throw error;
}
