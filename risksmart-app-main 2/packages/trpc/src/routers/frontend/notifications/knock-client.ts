import { TRPCError } from '@trpc/server';

export interface KnockConfig {
  apiBase: string;
  secretKey: string;
}

export const resolveKnockConfig = (): KnockConfig => {
  const host = process.env.KNOCK_HOST;
  if (!host) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Notification service is not configured',
    });
  }

  const normalised = host.replace(/\/+$/, '');

  const key = process.env.KNOCK_SECRET_KEY;
  if (!key) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Notification service is not configured',
    });
  }

  return {
    apiBase: normalised,
    secretKey: key,
  };
};

export const mapStatusToTRPCCode = (status: number): TRPCError['code'] => {
  if (status === 400) {
    return 'BAD_REQUEST';
  }
  if (status === 401) {
    return 'UNAUTHORIZED';
  }
  if (status === 403) {
    return 'FORBIDDEN';
  }
  if (status === 404) {
    return 'NOT_FOUND';
  }
  if (status === 429) {
    return 'TOO_MANY_REQUESTS';
  }

  return 'INTERNAL_SERVER_ERROR';
};

export const mapStatusToMessage = (status: number): string => {
  if (status === 400) {
    return 'Bad request to notification service';
  }
  if (status === 401) {
    return 'Unauthorized access to notification service';
  }
  if (status === 403) {
    return 'Forbidden access to notification service';
  }
  if (status === 404) {
    return 'Resource not found in notification service';
  }
  if (status === 429) {
    return 'Too many requests to notification service';
  }

  return 'Notification service error';
};

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

export const fetchWithRetry = async <T>(
  url: string,
  config: KnockConfig,
  options: RequestInit = {}
): Promise<T> => {
  const method = options.method ?? 'GET';
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      ...options,
      method,
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        ...(options.headers ?? {}),
      },
    });

    if (response.status === 429) {
      if (attempt < MAX_RETRIES) {
        const delay = BASE_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests to notification service',
      });
    }

    if (!response.ok) {
      throw new TRPCError({
        code: mapStatusToTRPCCode(response.status),
        message: mapStatusToMessage(response.status),
      });
    }

    return (await response.json()) as T;
  }

  // Unreachable — the loop always returns or throws — but required by TypeScript
  /* istanbul ignore next */
  throw new TRPCError({
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests to notification service',
  });
};
