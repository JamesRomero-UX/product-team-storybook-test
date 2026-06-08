// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Auth extends APIResource {
  /**
   * Return information about the current calling scope. Will either be a service
   * token or from an OAuth context.
   *
   * @example
   * ```ts
   * const response = await client.auth.verify();
   * ```
   */
  verify(options?: RequestOptions): APIPromise<AuthVerifyResponse> {
    return this._client.get('/v1/whoami', options);
  }
}

/**
 * Information about the current calling scope.
 */
export interface AuthVerifyResponse {
  account_name: string;

  account_slug: string;

  type: 'service_token' | 'oauth_context';

  service_token_name?: string | null;

  user_id?: string | null;
}

export declare namespace Auth {
  export { type AuthVerifyResponse as AuthVerifyResponse };
}
