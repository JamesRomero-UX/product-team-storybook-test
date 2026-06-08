// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Partials extends APIResource {
  /**
   * Get a partial by its key.
   *
   * @example
   * ```ts
   * const partial = await client.partials.retrieve(
   *   'partial_key',
   *   { environment: 'development' },
   * );
   * ```
   */
  retrieve(partialKey: string, query: PartialRetrieveParams, options?: RequestOptions): APIPromise<Partial> {
    return this._client.get(path`/v1/partials/${partialKey}`, { query, ...options });
  }

  /**
   * List all partials for a given environment.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const partial of client.partials.list({
   *   environment: 'development',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(query: PartialListParams, options?: RequestOptions): PagePromise<PartialsEntriesCursor, Partial> {
    return this._client.getAPIList('/v1/partials', EntriesCursor<Partial>, { query, ...options });
  }

  /**
   * Updates a partial of a given key, or creates a new one if it does not yet exist.
   *
   * Note: this endpoint only operates on partials in the “development” environment.
   *
   * @example
   * ```ts
   * const response = await client.partials.upsert(
   *   'partial_key',
   *   {
   *     environment: 'development',
   *     partial: {
   *       content: '<p>Hello, world!</p>',
   *       name: 'My Partial',
   *       type: 'html',
   *     },
   *   },
   * );
   * ```
   */
  upsert(
    partialKey: string,
    params: PartialUpsertParams,
    options?: RequestOptions,
  ): APIPromise<PartialUpsertResponse> {
    const { environment, annotate, commit, commit_message, ...body } = params;
    return this._client.put(path`/v1/partials/${partialKey}`, {
      query: { environment, annotate, commit, commit_message },
      body,
      ...options,
    });
  }

  /**
   * Validates a partial payload without persisting it.
   *
   * Note: this endpoint only operates on partials in the “development” environment.
   *
   * @example
   * ```ts
   * const response = await client.partials.validate(
   *   'partial_key',
   *   {
   *     environment: 'development',
   *     partial: {
   *       content: '<p>Hello, world!</p>',
   *       name: 'My Partial',
   *       type: 'html',
   *     },
   *   },
   * );
   * ```
   */
  validate(
    partialKey: string,
    params: PartialValidateParams,
    options?: RequestOptions,
  ): APIPromise<PartialValidateResponse> {
    const { environment, ...body } = params;
    return this._client.put(path`/v1/partials/${partialKey}/validate`, {
      query: { environment },
      body,
      ...options,
    });
  }
}

export type PartialsEntriesCursor = EntriesCursor<Partial>;

/**
 * A partial is a reusable piece of content that can be used in a template.
 */
export interface Partial {
  /**
   * The partial content.
   */
  content: string;

  /**
   * The timestamp of when the partial was created.
   */
  inserted_at: string;

  /**
   * The unique key string for the partial object. Must be at minimum 3 characters
   * and at maximum 255 characters in length. Must be in the format of ^[a-z0-9_-]+$.
   */
  key: string;

  /**
   * A name for the partial. Must be at maximum 255 characters in length.
   */
  name: string;

  /**
   * The partial type. One of 'html', 'json', 'markdown', 'text'.
   */
  type: 'html' | 'text' | 'json' | 'markdown';

  /**
   * The timestamp of when the partial was last updated.
   */
  updated_at: string;

  /**
   * Whether the partial and its content are in a valid state.
   */
  valid: boolean;

  /**
   * An arbitrary string attached to a partial object. Useful for adding notes about
   * the partial for internal purposes. Maximum of 280 characters allowed.
   */
  description?: string;

  /**
   * The slug of the environment in which the partial exists.
   */
  environment?: string;

  /**
   * The name of the icon to be used in the visual editor.
   */
  icon_name?: string;

  /**
   * Indicates whether the partial can be used in the visual editor. Only applies to
   * HTML partials.
   */
  visual_block_enabled?: boolean;
}

/**
 * Wraps the Partial response under the `partial` key.
 */
export interface PartialUpsertResponse {
  /**
   * A partial is a reusable piece of content that can be used in a template.
   */
  partial: Partial;
}

/**
 * Wraps the Partial response under the `partial` key.
 */
export interface PartialValidateResponse {
  /**
   * A partial is a reusable piece of content that can be used in a template.
   */
  partial: Partial;
}

export interface PartialRetrieveParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Whether to hide uncommitted changes. When true, only committed changes will be
   * returned. When false, both committed and uncommitted changes will be returned.
   */
  hide_uncommitted_changes?: boolean;
}

export interface PartialListParams extends EntriesCursorParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Whether to hide uncommitted changes. When true, only committed changes will be
   * returned. When false, both committed and uncommitted changes will be returned.
   */
  hide_uncommitted_changes?: boolean;
}

export interface PartialUpsertParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A partial object with attributes to update or create a partial.
   */
  partial: PartialUpsertParams.Partial;

  /**
   * Query param: Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Query param: Whether to commit the resource at the same time as modifying it.
   */
  commit?: boolean;

  /**
   * Query param: The message to commit the resource with, only used if `commit` is
   * `true`.
   */
  commit_message?: string;
}

export namespace PartialUpsertParams {
  /**
   * A partial object with attributes to update or create a partial.
   */
  export interface Partial {
    /**
     * The content of the partial.
     */
    content: string;

    /**
     * The name of the partial.
     */
    name: string;

    /**
     * The type of the partial.
     */
    type: 'html' | 'text' | 'json' | 'markdown';

    /**
     * The description of the partial.
     */
    description?: string | null;

    /**
     * The name of the icon to be used in the visual editor. Only relevant when
     * `visual_block_enabled` is `true`.
     */
    icon_name?: string | null;

    /**
     * Indicates whether the partial can be used in the visual editor. Only applies to
     * HTML partials.
     */
    visual_block_enabled?: boolean | null;
  }
}

export interface PartialValidateParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A partial object with attributes to update or create a partial.
   */
  partial: PartialValidateParams.Partial;
}

export namespace PartialValidateParams {
  /**
   * A partial object with attributes to update or create a partial.
   */
  export interface Partial {
    /**
     * The content of the partial.
     */
    content: string;

    /**
     * The name of the partial.
     */
    name: string;

    /**
     * The type of the partial.
     */
    type: 'html' | 'text' | 'json' | 'markdown';

    /**
     * The description of the partial.
     */
    description?: string | null;

    /**
     * The name of the icon to be used in the visual editor. Only relevant when
     * `visual_block_enabled` is `true`.
     */
    icon_name?: string | null;

    /**
     * Indicates whether the partial can be used in the visual editor. Only applies to
     * HTML partials.
     */
    visual_block_enabled?: boolean | null;
  }
}

export declare namespace Partials {
  export {
    type Partial as Partial,
    type PartialUpsertResponse as PartialUpsertResponse,
    type PartialValidateResponse as PartialValidateResponse,
    type PartialsEntriesCursor as PartialsEntriesCursor,
    type PartialRetrieveParams as PartialRetrieveParams,
    type PartialListParams as PartialListParams,
    type PartialUpsertParams as PartialUpsertParams,
    type PartialValidateParams as PartialValidateParams,
  };
}
