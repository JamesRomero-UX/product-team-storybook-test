/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';
import type {
  ICredentialDataDecryptedObject,
  IDataObject,
  IExecuteFunctions,
  IHttpRequestOptions,
} from 'n8n-workflow';
import { jsonStringify, NodeApiError } from 'n8n-workflow';

interface IRiskSmartAuthToken {
  token_type: string;
  access_token: string;
  expires_in: number;
}

// Module-level token cache - keyed by Auth0 client identity
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/**
 * Generates a cache key from credentials
 */
function getCacheKey(credentials: ICredentialDataDecryptedObject): string {
  return `${credentials.domain}:${credentials.clientId}`;
}

/**
 * Gets a valid token from cache, or null if expired/missing
 */
function getCachedToken(
  credentials: ICredentialDataDecryptedObject
): string | null {
  const key = getCacheKey(credentials);
  const cached = tokenCache.get(key);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  // Clean up expired entry
  if (cached) {
    tokenCache.delete(key);
  }

  return null;
}

/**
 * Caches a token, parsing its expiration from the JWT payload
 * @param bufferSeconds Seconds before actual expiry to consider it expired (default 300s / 5mins)
 */
function setCachedToken(
  credentials: ICredentialDataDecryptedObject,
  token: string,
  bufferSeconds = 300
): void {
  try {
    const payload = jwtDecode<{ exp?: number }>(token);

    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
      return;
    }

    const expiresAt = payload.exp * 1000 - bufferSeconds * 1000;
    tokenCache.set(getCacheKey(credentials), { token, expiresAt });
  } catch {
    // If we can't parse the token, don't cache it
  }
}

export function getHasuraBaseUrl() {
  return process.env.RS_API_DOMAIN
    ? `https://${process.env.RS_API_DOMAIN}/v1/graphql`
    : 'http://host.docker.internal:8080/v1/graphql';
}

export function getIntegrationApiBaseUrl(path: string): string {
  return `https://${process.env.RS_INTEGRATIONS_API_DOMAIN}/integration/${path}`;
}

export async function fetchToken(
  context: IExecuteFunctions,
  credentials: ICredentialDataDecryptedObject
): Promise<{ sessionToken: string }> {
  const token: IRiskSmartAuthToken = (await context.helpers.httpRequest({
    method: 'POST',
    url: `https://${credentials.domain}/oauth/token`,
    body: {
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      audience: `${credentials.apiIdentId}`,
      grant_type: credentials.grantType,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })) as IRiskSmartAuthToken;

  return { sessionToken: token.access_token };
}

export async function makeHttpGetRequest(
  context: IExecuteFunctions,
  baseURL: string
): Promise<any> {
  return await makeHttpRequestInternal({
    context,
    body: undefined,
    baseURL,
    method: 'GET',
  });
}

export async function makeHttpRequest(
  context: IExecuteFunctions,
  body: any,
  baseURL: string
): Promise<any> {
  return await makeHttpRequestInternal({
    context,
    body,
    baseURL,
    method: 'POST',
  });
}

async function makeHttpRequestInternal(input: {
  context: IExecuteFunctions;
  body: any;
  baseURL: string;
  method: 'POST' | 'GET';
}): Promise<any> {
  const { context, body, baseURL, method } = input;

  let responseData;

  try {
    const credentials = await context.getCredentials('riskSmartAuthApi');

    // Check module-level cache for valid token
    let token = getCachedToken(credentials);

    // If no valid token in cache, fetch fresh from Auth0
    if (!token) {
      context.logger.info(
        'No valid token available in cache, fetching and caching fresh token'
      );
      const freshToken = await fetchToken(context, credentials);
      token = freshToken.sessionToken;
      setCachedToken(credentials, token);
    }

    // Make request with the token
    const options: IHttpRequestOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-tenant-name': credentials.tenantIdentId as string,
      },
      method,
      body,
      url: baseURL,
      json: true,
    };

    responseData = await context.helpers.httpRequest(options);
    context.logger.info('API Response', { response: responseData });

    // Handle JWTExpired in response (edge case - clock skew, race condition)
    if (isJWTExpiredResponse(responseData)) {
      context.logger.info(
        'JWT expired in API response, fetching and caching fresh token and retrying'
      );
      const freshToken = await fetchToken(context, credentials);
      token = freshToken.sessionToken;
      setCachedToken(credentials, token);

      const retryOptions: IHttpRequestOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      };

      responseData = await context.helpers.httpRequest(retryOptions);
      context.logger.info('Retry API Response', { response: responseData });
    }

    if (responseData.errors) {
      const error = new NodeApiError(context.getNode(), responseData, {
        message: jsonStringify(responseData.errors),
      });
      error.cause = options as any;
      throw error;
    }
  } catch (e: any) {
    const error = new NodeApiError(context.getNode(), responseData || {}, {
      message: jsonStringify(e),
    });
    error.cause = e?.cause;
    throw error;
  }

  return responseData;
}

function isJWTExpiredResponse(responseData: any): boolean {
  return Boolean(
    responseData?.errors &&
    Array.isArray(responseData.errors) &&
    responseData.errors[0] &&
    typeof responseData.errors[0].message === 'string' &&
    responseData.errors[0].message.includes('JWTExpired')
  );
}

/**
 * Makes a paginated HTTP request. Currently supports pagination via `offset` and `limit`
 * query parameters supplied via n8n webhook context
 * @param context The execution context.
 * @param body The request body.
 * @param baseURL The base URL for the request.
 * @returns The paginated response data.
 */
export async function makePaginatedHttpRequest(
  context: IExecuteFunctions,
  body: { [key: string]: any; variables?: IDataObject },
  baseURL: string
): Promise<{
  data: any[];
  pagination: { total: number; offset: number; limit: number };
}> {
  let limit: number | undefined;
  let offset: number | undefined;

  const queryParams = context.getInputData(0)[0].json['query'] as
    | IDataObject
    | undefined;

  if (queryParams?.offset) {
    offset = parseInt(queryParams.offset as string, 10);
  }
  if (!offset || isNaN(offset) || offset < 0) {
    offset = 0; // Default offset
  }

  if (queryParams?.limit) {
    limit = parseInt(queryParams.limit as string, 10);
  }
  if (!limit || isNaN(limit) || limit < 1 || limit > 100) {
    limit = 100; // Default limit
  }

  const paginationVariables = {
    offset,
    limit,
  };

  const bodyWithVariables = {
    ...body,
    variables: { ...body.variables, ...paginationVariables },
  };

  const responseData = await makeHttpRequest(
    context,
    bodyWithVariables,
    baseURL
  );

  return {
    data: responseData?.data?.data || [],
    pagination: {
      total: responseData?.data?.pagination?.aggregate?.count || 0,
      offset,
      limit,
    },
  };
}
