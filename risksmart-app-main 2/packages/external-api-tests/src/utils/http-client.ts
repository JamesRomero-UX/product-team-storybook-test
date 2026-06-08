import { createAuthHeaders } from './test-auth';

const getBaseUrl = () => process.env.EXTERNAL_API_URL;

export interface HttpClientOptions {
  token: string;
}

export interface RequestOptions {
  params?: Record<string, string | number | undefined>;
}

export const createHttpClient = (options: HttpClientOptions) => {
  const { token } = options;

  const buildUrl = (path: string, params?: RequestOptions['params']) => {
    const url = new URL(`${getBaseUrl()}/api/v1${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  };

  const get = async <T>(
    path: string,
    options?: RequestOptions
  ): Promise<{ status: number; data: T }> => {
    const response = await fetch(buildUrl(path, options?.params), {
      method: 'GET',
      headers: {
        ...createAuthHeaders(token),
        'Content-Type': 'application/json',
      },
    });

    // Generic HTTP client — T is supplied by the caller who owns the type contract; no schema available here.
    const data = (await response.json()) as T;

    return { status: response.status, data };
  };

  const post = async <T>(
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<{ status: number; data: T }> => {
    const response = await fetch(buildUrl(path, options?.params), {
      method: 'POST',
      headers: {
        ...createAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Generic HTTP client — T is supplied by the caller who owns the type contract; no schema available here.
    const data = (await response.json()) as T;

    return { status: response.status, data };
  };

  return { get, post };
};

export type HttpClient = ReturnType<typeof createHttpClient>;
