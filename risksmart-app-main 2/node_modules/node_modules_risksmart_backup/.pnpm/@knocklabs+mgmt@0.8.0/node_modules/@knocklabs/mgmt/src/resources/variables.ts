// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';

export class Variables extends APIResource {
  /**
   * Returns a paginated list of variables for a given environment.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const variable of client.variables.list({
   *   environment: 'development',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(query: VariableListParams, options?: RequestOptions): PagePromise<VariablesEntriesCursor, Variable> {
    return this._client.getAPIList('/v1/variables', EntriesCursor<Variable>, { query, ...options });
  }
}

export type VariablesEntriesCursor = EntriesCursor<Variable>;

/**
 * An environment variable object.
 */
export interface Variable {
  /**
   * The timestamp of when the variable was created.
   */
  inserted_at: string;

  /**
   * The key of the variable.
   */
  key: string;

  /**
   * The type of the variable.
   */
  type: 'public' | 'secret';

  /**
   * The timestamp of when the variable was last updated.
   */
  updated_at: string;

  /**
   * The value of the variable.
   */
  value: string;

  /**
   * The description of the variable.
   */
  description?: string | null;
}

export interface VariableListParams extends EntriesCursorParams {
  /**
   * The environment slug.
   */
  environment: string;
}

export declare namespace Variables {
  export {
    type Variable as Variable,
    type VariablesEntriesCursor as VariablesEntriesCursor,
    type VariableListParams as VariableListParams,
  };
}
