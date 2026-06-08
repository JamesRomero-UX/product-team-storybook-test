import { TRPCClientError } from '@trpc/client';
import { ZodError, type ZodIssue } from 'zod';

import { serializeZodError } from '../utils/schemas';

// TRPC error codes as defined by the tRPC specification
export type TRPCErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'CONFLICT'
  | 'PRECONDITION_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'METHOD_NOT_SUPPORTED'
  | 'UNPROCESSABLE_CONTENT'
  | 'TOO_MANY_REQUESTS'
  | 'CLIENT_CLOSED_REQUEST'
  | 'INTERNAL_SERVER_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT';

// Shape of tRPC error data containing code and httpStatus
interface TRPCErrorData {
  code?: TRPCErrorCode;
  httpStatus?: number;
}

// tRPC client error shape with the properties we need
interface TRPCClientErrorShape extends Error {
  data?: TRPCErrorData;
}

// Maps TRPC error codes to HTTP error names
const TRPC_CODE_TO_ERROR_NAME: Partial<Record<TRPCErrorCode, string>> = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  UNPROCESSABLE_CONTENT: 'Unprocessable Entity',
  TOO_MANY_REQUESTS: 'Too Many Requests',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
};

// Type guard for TRPCClientError
export function isTRPCClientError(
  error: unknown
): error is TRPCClientErrorShape {
  return error instanceof TRPCClientError;
}

// Gets the HTTP status code from a TRPCClientError
export function getTRPCErrorHttpStatus(error: TRPCClientErrorShape): number {
  return error.data?.httpStatus ?? 500;
}

// Gets a human-readable error name from the TRPC error code
export function getTRPCErrorName(error: TRPCClientErrorShape): string {
  const code = error.data?.code;

  return code
    ? (TRPC_CODE_TO_ERROR_NAME[code] ?? 'Internal Server Error')
    : 'Internal Server Error';
}

interface ParsedTRPCErrorMessage {
  message: string;
  details?: { field: string; message: string }[];
}

function isZodIssueShape(value: unknown): value is ZodIssue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    Array.isArray((value as ZodIssue).path) &&
    'message' in value &&
    typeof (value as ZodIssue).message === 'string'
  );
}

// Parses TRPCClientError message, extracting Zod validation details if present
export function parseTRPCErrorMessage(
  error: TRPCClientErrorShape
): ParsedTRPCErrorMessage {
  try {
    const parsed = JSON.parse(error.message) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(isZodIssueShape)
    ) {
      const zodError = new ZodError(parsed);

      return {
        message: 'Request validation failed',
        details: serializeZodError(zodError),
      };
    }
  } catch {
    // Message is not parseable JSON, return a generic message for the error code
  }

  return { message: getTRPCErrorName(error) };
}

// Determines if a tRPC error is transient (5xx) and retryable
export function isTRPCTransientError(error: TRPCClientErrorShape): boolean {
  const httpStatus = getTRPCErrorHttpStatus(error);

  return httpStatus >= 500;
}
