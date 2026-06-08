import { TRPCError } from '@trpc/server';

import { DataLayerApiError } from '../clients/data-layer-api-client';

/**
 * Default error messages for common HTTP status codes
 */
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request data',
  401: 'Authentication required',
  403: 'You do not have permission to perform this action',
  404: 'Resource not found',
  409: 'Resource conflict',
  422: 'Unprocessable entity',
  500: 'Internal server error',
};

/**
 * Maps HTTP status codes to TRPC error codes
 */
const HTTP_TO_TRPC_CODE: Record<number, TRPCError['code']> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_CONTENT',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'INTERNAL_SERVER_ERROR',
  503: 'INTERNAL_SERVER_ERROR',
  504: 'TIMEOUT',
};

/**
 * Custom error message overrides per HTTP status code
 */
export interface ErrorMessageOverrides {
  400?: string;
  401?: string;
  403?: string;
  404?: string;
  409?: string;
  422?: string;
  500?: string;
  default?: string;
}

/**
 * Extracts an error message from a response object
 * Handles various response shapes (e.g., { message: '...' }, { error: '...' })
 */
const extractMessageFromResponse = (response: unknown): string | undefined => {
  if (typeof response === 'string') {
    return response;
  }

  if (typeof response === 'object' && response !== null) {
    if ('message' in response && typeof response.message === 'string') {
      return response.message;
    }
    if ('error' in response && typeof response.error === 'string') {
      return response.error;
    }
  }

  return undefined;
};

/**
 * Maps an HTTP status code to a TRPCError
 *
 * @param status - HTTP status code from the API response
 * @param response - Response body (used to extract error message if available)
 * @param overrides - Optional custom error messages per status code
 * @returns TRPCError with appropriate code and message
 *
 * @example
 * // Basic usage
 * throw mapHttpStatusToTRPCError(403, { message: 'Access denied' });
 *
 * @example
 * // With custom messages
 * throw mapHttpStatusToTRPCError(404, response, {
 *   404: 'Parent action not found',
 *   403: 'You do not have permission to create action updates',
 * });
 */
export const mapHttpStatusToTRPCError = (
  status: number,
  response?: unknown,
  overrides?: ErrorMessageOverrides
): TRPCError => {
  // Determine TRPC error code
  const trpcCode: TRPCError['code'] =
    HTTP_TO_TRPC_CODE[status] ?? 'INTERNAL_SERVER_ERROR';

  // Determine error message (priority: override > response > default)
  const overrideMessage =
    overrides?.[status as keyof ErrorMessageOverrides] ?? overrides?.default;
  const responseMessage = extractMessageFromResponse(response);
  const defaultMessage =
    DEFAULT_ERROR_MESSAGES[status] ?? 'An unexpected error occurred';

  const message = overrideMessage ?? responseMessage ?? defaultMessage;

  return new TRPCError({
    code: trpcCode,
    message,
  });
};

/**
 * Catches a DataLayerApiError and remaps it to a TRPCError.
 * Re-throws non-DataLayerApiError errors as-is.
 */
export function mapDataLayerError(
  error: unknown,
  overrides?: ErrorMessageOverrides
): never {
  if (error instanceof DataLayerApiError) {
    throw mapHttpStatusToTRPCError(error.status, error.responseBody, overrides);
  }
  throw error;
}

/**
 * Checks if a status code indicates success
 */
export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300;
};
