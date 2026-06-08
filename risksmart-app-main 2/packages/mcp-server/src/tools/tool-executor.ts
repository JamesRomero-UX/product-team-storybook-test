import {
  AuthenticationError,
  AuthorizationError,
  ExternalServiceError,
  ValidationError,
} from '../errors';
import { getEnv } from '../utils/environment';
import { logger } from '../utils/logger';
import { requestStore } from '../utils/request-store';
import { FETCH_TIMEOUT_MS } from './constants';
import type { ToolExecutor } from './types';

const MAX_INPUT_SIZE = 10_000;
const MAX_LOG_BODY_LENGTH = 500;

/**
 * Execute a tRPC procedure by making an HTTP call to the tRPC service.
 * Passes the user's JWT so the tRPC server handles auth and permissions.
 */
export const executeTrpcTool: ToolExecutor = async (
  toolDef,
  input,
  session
) => {
  const trpcBaseUrl = getEnv('TRPC_SERVICE_BASE_URL');
  const procedurePath = toolDef.procedurePath;

  logger.info(
    { tool: toolDef.name, procedure: procedurePath },
    'Executing MCP tool via tRPC HTTP'
  );

  // Build the tRPC HTTP URL.
  // tRPC queries use GET with input as a query parameter.
  // Input is wrapped in superjson format: { json: <input> }
  // Always send input — tRPC procedures expect an object even when empty.
  const serialized = JSON.stringify({ json: input });
  if (serialized.length > MAX_INPUT_SIZE) {
    throw new ValidationError(
      `Input too large (${serialized.length} bytes, max ${MAX_INPUT_SIZE})`
    );
  }

  const encodedInput = encodeURIComponent(serialized);
  const url = `${trpcBaseUrl}/trpc/${procedurePath}?input=${encodedInput}`;

  const correlationId = requestStore.getStore()?.correlationId;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${session.accessToken}`,
      ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error(
      { tool: toolDef.name, status: response.status },
      'tRPC call failed'
    );
    logger.debug(
      {
        tool: toolDef.name,
        status: response.status,
        body: errorBody.slice(0, MAX_LOG_BODY_LENGTH),
      },
      'tRPC error response body'
    );

    switch (response.status) {
      case 401:
        throw new AuthenticationError(
          'Session expired or invalid — re-authenticate.'
        );
      case 403:
        throw new AuthorizationError('Access denied by the backend service.');
      default:
        throw new ExternalServiceError(
          'tRPC service',
          `${response.status} ${response.statusText}`
        );
    }
  }

  // tRPC with superjson returns { result: { data: { json: <data>, meta: {...} } } }
  // We extract the json field which has dates as ISO strings already.
  const trpcResponse = (await response.json()) as {
    result?: { data?: { json?: unknown } };
  };

  const data = trpcResponse?.result?.data?.json ?? trpcResponse?.result?.data;

  return JSON.stringify(data, null, 2);
};
