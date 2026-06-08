// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class APIKeys extends APIResource {
  /**
   * Given an authenticated service token and an environment, will exchange the
   * service token for a secret API key that can be used to make requests to the
   * public API.
   *
   * @example
   * ```ts
   * const response = await client.apiKeys.exchange({
   *   environment: 'development',
   * });
   * ```
   */
  exchange(params: APIKeyExchangeParams, options?: RequestOptions): APIPromise<APIKeyExchangeResponse> {
    const { environment } = params;
    return this._client.post('/v1/api_keys/exchange', { query: { environment }, ...options });
  }
}

/**
 * Returns an API key that can be used to make requests to the public API.
 */
export interface APIKeyExchangeResponse {
  /**
   * The secret API key exchanged from the service token.
   */
  api_key: string;
}

export interface APIKeyExchangeParams {
  /**
   * The environment slug.
   */
  environment: string;
}

export declare namespace APIKeys {
  export {
    type APIKeyExchangeResponse as APIKeyExchangeResponse,
    type APIKeyExchangeParams as APIKeyExchangeParams,
  };
}
