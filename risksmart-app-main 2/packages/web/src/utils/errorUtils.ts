import * as Sentry from '@sentry/browser';
import type { CaptureContext } from '@sentry/core';
import type { AxiosError } from 'axios';

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maybeError: AxiosError<any, any>
): ErrorWithMessage {
  if (
    maybeError.response?.data &&
    isErrorWithMessage(maybeError.response?.data)
  ) {
    return maybeError.response.data;
  }

  if (isErrorWithMessage(maybeError)) {
    return maybeError;
  }

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorMessage(error: AxiosError<any, any>): string {
  return toErrorWithMessage(error).message;
}

export function handleError(
  error: unknown,
  captureContext?: CaptureContext,
  transactionName?: string
) {
  if (transactionName) {
    Sentry.getCurrentScope().setTransactionName(transactionName);
  }
  Sentry.captureException(error, captureContext);
  console.error(error, captureContext);
}
