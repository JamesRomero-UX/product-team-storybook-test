// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as GuidesAPI from './guides';
import * as WorkflowsAPI from './workflows/workflows';
import { APIPromise } from '../core/api-promise';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Guides extends APIResource {
  /**
   * Get a guide by its key.
   *
   * @example
   * ```ts
   * const guide = await client.guides.retrieve('guide_key', {
   *   environment: 'development',
   * });
   * ```
   */
  retrieve(guideKey: string, query: GuideRetrieveParams, options?: RequestOptions): APIPromise<Guide> {
    return this._client.get(path`/v1/guides/${guideKey}`, { query, ...options });
  }

  /**
   * Returns a paginated list of guides available in a given environment.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const guide of client.guides.list({
   *   environment: 'development',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(query: GuideListParams, options?: RequestOptions): PagePromise<GuidesEntriesCursor, Guide> {
    return this._client.getAPIList('/v1/guides', EntriesCursor<Guide>, { query, ...options });
  }

  /**
   * Activates (or deactivates) a guide in a given environment. You can either set
   * the active status immediately or schedule it.
   *
   * Note: This immediately enables or disables a guide in a given environment
   * without needing to go through environment promotion.
   *
   * @example
   * ```ts
   * const response = await client.guides.activate('guide_key', {
   *   environment: 'development',
   *   status: true,
   * });
   * ```
   */
  activate(
    guideKey: string,
    params: GuideActivateParams,
    options?: RequestOptions,
  ): APIPromise<GuideActivateResponse> {
    const { environment, ...body } = params;
    return this._client.put(path`/v1/guides/${guideKey}/activate`, {
      query: { environment },
      body,
      ...options,
    });
  }

  /**
   * Updates a guide of a given key, or creates a new one if it does not yet exist.
   *
   * Note: this endpoint only operates on guides in the "development" environment.
   *
   * @example
   * ```ts
   * const response = await client.guides.upsert('guide_key', {
   *   environment: 'development',
   *   guide: {
   *     channel_key: 'in-app-guide',
   *     name: 'Getting Started Guide',
   *     steps: [
   *       {
   *         ref: 'welcome-step',
   *         schema_key: 'tooltip',
   *         schema_semver: '1.0.0',
   *         schema_variant_key: 'default',
   *       },
   *     ],
   *   },
   * });
   * ```
   */
  upsert(
    guideKey: string,
    params: GuideUpsertParams,
    options?: RequestOptions,
  ): APIPromise<GuideUpsertResponse> {
    const { environment, annotate, commit, commit_message, ...body } = params;
    return this._client.put(path`/v1/guides/${guideKey}`, {
      query: { environment, annotate, commit, commit_message },
      body,
      ...options,
    });
  }

  /**
   * Validates a guide payload without persisting it.
   *
   * Note: Validating a guide is only done in the development environment context.
   *
   * @example
   * ```ts
   * const response = await client.guides.validate('guide_key', {
   *   environment: 'development',
   *   guide: {
   *     channel_key: 'in-app-guide',
   *     name: 'Getting Started Guide',
   *     steps: [
   *       {
   *         ref: 'welcome-step',
   *         schema_key: 'tooltip',
   *         schema_semver: '1.0.0',
   *         schema_variant_key: 'default',
   *       },
   *     ],
   *   },
   * });
   * ```
   */
  validate(
    guideKey: string,
    params: GuideValidateParams,
    options?: RequestOptions,
  ): APIPromise<GuideValidateResponse> {
    const { environment, ...body } = params;
    return this._client.put(path`/v1/guides/${guideKey}/validate`, {
      query: { environment },
      body,
      ...options,
    });
  }
}

export type GuidesEntriesCursor = EntriesCursor<Guide>;

/**
 * A guide defines an in-app guide that can be displayed to users based on priority
 * and other conditions.
 */
export interface Guide {
  /**
   * Whether the guide is active.
   */
  active: boolean;

  /**
   * The timestamp of when the guide was created.
   */
  created_at: string;

  /**
   * The slug of the environment in which the guide exists.
   */
  environment: string;

  /**
   * The unique key string for the guide object. Must be at minimum 3 characters and
   * at maximum 255 characters in length. Must be in the format of ^[a-z0-9_-]+$.
   */
  key: string;

  /**
   * A name for the guide. Must be at maximum 255 characters in length.
   */
  name: string;

  /**
   * The SHA hash of the guide.
   */
  sha: string;

  /**
   * The timestamp of when the guide was last updated.
   */
  updated_at: string;

  /**
   * A list of activation url patterns that describe when the guide should be shown.
   */
  activation_url_patterns?: Array<Guide.ActivationURLPattern>;

  /**
   * The timestamp of when the guide was archived.
   */
  archived_at?: string | null;

  /**
   * The key of the channel in which the guide exists.
   */
  channel_key?: string;

  /**
   * The timestamp of when the guide was deleted.
   */
  deleted_at?: string | null;

  /**
   * An arbitrary string attached to a guide object. Useful for adding notes about
   * the guide for internal purposes. Maximum of 280 characters allowed.
   */
  description?: string | null;

  /**
   * The semver of the guide.
   */
  semver?: string;

  /**
   * A list of guide step objects in the guide.
   */
  steps?: Array<GuideStep>;

  /**
   * The ID of the target audience for the guide. When not set, will default to
   * targeting all users.
   */
  target_audience_id?: string | null;

  /**
   * A group of conditions to be evaluated.
   */
  target_property_conditions?: WorkflowsAPI.ConditionGroup | null;

  /**
   * The type of the guide. This is derived from the message type of the guide steps.
   */
  type?: string;

  /**
   * Whether the guide is valid.
   */
  valid?: boolean;
}

export namespace Guide {
  /**
   * A rule that controls when a guide should be shown based on the user's location
   * in the application.
   */
  export interface ActivationURLPattern {
    /**
     * Whether to allow or block the guide at the specified pathname.
     */
    directive: 'allow' | 'block';

    /**
     * The URL pathname pattern to match against. Must be a valid URI path.
     */
    pathname: string;
  }
}

/**
 * A step in a guide that corresponds to a piece of UI and its content.
 */
export interface GuideStep {
  /**
   * The unique reference string for the step. Must be at minimum 3 characters and at
   * maximum 255 characters in length. Must be in the format of ^[a-z0-9_-]+$.
   */
  ref: string;

  /**
   * The key of the template schema to use for this step.
   */
  schema_key: string;

  /**
   * The semantic version of the template schema to use.
   */
  schema_semver: string;

  /**
   * The key of the template schema variant to use.
   */
  schema_variant_key: string;

  /**
   * A name for the step.
   */
  name?: string;

  /**
   * A map of values that make up the step's content. Each value must conform to its
   * respective template schema field settings.
   */
  values?: { [key: string]: unknown };
}

/**
 * Wraps the Guide response under the `guide` key.
 */
export interface GuideActivateResponse {
  /**
   * A guide defines an in-app guide that can be displayed to users based on priority
   * and other conditions.
   */
  guide: Guide;
}

/**
 * Wraps the Guide response under the `guide` key.
 */
export interface GuideUpsertResponse {
  /**
   * A guide defines an in-app guide that can be displayed to users based on priority
   * and other conditions.
   */
  guide: Guide;
}

/**
 * Wraps the Guide response under the `guide` key.
 */
export interface GuideValidateResponse {
  /**
   * A guide defines an in-app guide that can be displayed to users based on priority
   * and other conditions.
   */
  guide: Guide;
}

export interface GuideRetrieveParams {
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

export interface GuideListParams extends EntriesCursorParams {
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

export type GuideActivateParams =
  | GuideActivateParams.GuideBooleanActivationParams
  | GuideActivateParams.GuideScheduledActivationParams;

export declare namespace GuideActivateParams {
  export interface GuideBooleanActivationParams {
    /**
     * Query param: The environment slug.
     */
    environment: string;

    /**
     * Body param: Whether to activate or deactivate the guide.
     */
    status: boolean;
  }

  export interface GuideScheduledActivationParams {
    /**
     * Query param: The environment slug.
     */
    environment: string;

    /**
     * Body param: When to activate the guide. If provided, the guide will be scheduled
     * to activate at this time. Must be in ISO 8601 UTC format.
     */
    from?: string;

    /**
     * Body param: When to deactivate the guide. If provided, the guide will be
     * scheduled to deactivate at this time. Must be in ISO 8601 UTC format.
     */
    until?: string;
  }
}

export interface GuideUpsertParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A request to create or update a guide.
   */
  guide: GuideUpsertParams.Guide;

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

export namespace GuideUpsertParams {
  /**
   * A request to create or update a guide.
   */
  export interface Guide {
    /**
     * The key of the channel in which the guide exists.
     */
    channel_key: string;

    /**
     * A name for the guide. Must be at maximum 255 characters in length.
     */
    name: string;

    /**
     * A list of guide step objects in the guide.
     */
    steps: Array<GuidesAPI.GuideStep>;

    /**
     * A list of activation url patterns that describe when the guide should be shown.
     */
    activation_url_patterns?: Array<Guide.ActivationURLPattern>;

    /**
     * The timestamp of when the guide was archived.
     */
    archived_at?: string | null;

    /**
     * The timestamp of when the guide was deleted.
     */
    deleted_at?: string | null;

    /**
     * An arbitrary string attached to a guide object. Useful for adding notes about
     * the guide for internal purposes. Maximum of 280 characters allowed.
     */
    description?: string | null;

    /**
     * The ID of the target audience for the guide. When not set, will default to
     * targeting all users.
     */
    target_audience_id?: string | null;

    /**
     * A group of conditions to be evaluated.
     */
    target_property_conditions?: WorkflowsAPI.ConditionGroup | null;
  }

  export namespace Guide {
    /**
     * A rule that controls when a guide should be shown based on the user's location
     * in the application.
     */
    export interface ActivationURLPattern {
      /**
       * Whether to allow or block the guide at the specified pathname.
       */
      directive: 'allow' | 'block';

      /**
       * The URL pathname pattern to match against. Must be a valid URI path.
       */
      pathname: string;
    }
  }
}

export interface GuideValidateParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A request to create or update a guide.
   */
  guide: GuideValidateParams.Guide;
}

export namespace GuideValidateParams {
  /**
   * A request to create or update a guide.
   */
  export interface Guide {
    /**
     * The key of the channel in which the guide exists.
     */
    channel_key: string;

    /**
     * A name for the guide. Must be at maximum 255 characters in length.
     */
    name: string;

    /**
     * A list of guide step objects in the guide.
     */
    steps: Array<GuidesAPI.GuideStep>;

    /**
     * A list of activation url patterns that describe when the guide should be shown.
     */
    activation_url_patterns?: Array<Guide.ActivationURLPattern>;

    /**
     * The timestamp of when the guide was archived.
     */
    archived_at?: string | null;

    /**
     * The timestamp of when the guide was deleted.
     */
    deleted_at?: string | null;

    /**
     * An arbitrary string attached to a guide object. Useful for adding notes about
     * the guide for internal purposes. Maximum of 280 characters allowed.
     */
    description?: string | null;

    /**
     * The ID of the target audience for the guide. When not set, will default to
     * targeting all users.
     */
    target_audience_id?: string | null;

    /**
     * A group of conditions to be evaluated.
     */
    target_property_conditions?: WorkflowsAPI.ConditionGroup | null;
  }

  export namespace Guide {
    /**
     * A rule that controls when a guide should be shown based on the user's location
     * in the application.
     */
    export interface ActivationURLPattern {
      /**
       * Whether to allow or block the guide at the specified pathname.
       */
      directive: 'allow' | 'block';

      /**
       * The URL pathname pattern to match against. Must be a valid URI path.
       */
      pathname: string;
    }
  }
}

export declare namespace Guides {
  export {
    type Guide as Guide,
    type GuideStep as GuideStep,
    type GuideActivateResponse as GuideActivateResponse,
    type GuideUpsertResponse as GuideUpsertResponse,
    type GuideValidateResponse as GuideValidateResponse,
    type GuidesEntriesCursor as GuidesEntriesCursor,
    type GuideRetrieveParams as GuideRetrieveParams,
    type GuideListParams as GuideListParams,
    type GuideActivateParams as GuideActivateParams,
    type GuideUpsertParams as GuideUpsertParams,
    type GuideValidateParams as GuideValidateParams,
  };
}
