// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Commits extends APIResource {
  /**
   * Retrieve a single commit by its ID.
   *
   * @example
   * ```ts
   * const commit = await client.commits.retrieve(
   *   '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
   * );
   * ```
   */
  retrieve(id: string, options?: RequestOptions): APIPromise<Commit> {
    return this._client.get(path`/v1/commits/${id}`, options);
  }

  /**
   * Returns a paginated list of commits in a given environment. The commits are
   * ordered from most recent first.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const commit of client.commits.list({
   *   environment: 'development',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(query: CommitListParams, options?: RequestOptions): PagePromise<CommitsEntriesCursor, Commit> {
    return this._client.getAPIList('/v1/commits', EntriesCursor<Commit>, { query, ...options });
  }

  /**
   * Commit all changes across all resources in the development environment.
   *
   * @example
   * ```ts
   * const response = await client.commits.commitAll({
   *   environment: 'development',
   * });
   * ```
   */
  commitAll(params: CommitCommitAllParams, options?: RequestOptions): APIPromise<CommitCommitAllResponse> {
    const { environment, commit_message } = params;
    return this._client.put('/v1/commits', { query: { environment, commit_message }, ...options });
  }

  /**
   * Promote all changes across all resources to the target environment from its
   * preceding environment.
   *
   * @example
   * ```ts
   * const response = await client.commits.promoteAll({
   *   to_environment: 'to_environment',
   * });
   * ```
   */
  promoteAll(params: CommitPromoteAllParams, options?: RequestOptions): APIPromise<CommitPromoteAllResponse> {
    const { to_environment } = params;
    return this._client.put('/v1/commits/promote', { query: { to_environment }, ...options });
  }

  /**
   * Promotes one change to the subsequent environment.
   *
   * @example
   * ```ts
   * const response = await client.commits.promoteOne('id');
   * ```
   */
  promoteOne(id: string, options?: RequestOptions): APIPromise<CommitPromoteOneResponse> {
    return this._client.put(path`/v1/commits/${id}/promote`, options);
  }
}

export type CommitsEntriesCursor = EntriesCursor<Commit>;

/**
 * A commit is a change to a resource within an environment, made by an author.
 */
export interface Commit {
  /**
   * The unique identifier for the commit.
   */
  id: string;

  /**
   * The author of the commit.
   */
  author: Commit.Author;

  /**
   * The timestamp of when the commit was created.
   */
  created_at: string;

  /**
   * The environment of the commit.
   */
  environment: string;

  /**
   * The resource object associated with the commit.
   */
  resource: Commit.Resource;

  /**
   * The optional message about the commit.
   */
  commit_message?: string;
}

export namespace Commit {
  /**
   * The author of the commit.
   */
  export interface Author {
    /**
     * The email address of the commit author.
     */
    email: string;

    /**
     * The name of the commit author.
     */
    name?: string | null;
  }

  /**
   * The resource object associated with the commit.
   */
  export interface Resource {
    /**
     * The unique identifier for the resource.
     */
    identifier: string;

    /**
     * The type of the resource object.
     */
    type:
      | 'dynamic_audience'
      | 'email_layout'
      | 'guide'
      | 'message_type'
      | 'partial'
      | 'translation'
      | 'workflow';
  }
}

/**
 * The response from committing all changes.
 */
export interface CommitCommitAllResponse {
  /**
   * The result of the commit operation.
   */
  result: string;
}

/**
 * The response from promoting all changes.
 */
export interface CommitPromoteAllResponse {
  /**
   * The result of the promote operation.
   */
  result: string;
}

/**
 * Wraps the Commit response under the `commit` key.
 */
export interface CommitPromoteOneResponse {
  /**
   * A commit is a change to a resource within an environment, made by an author.
   */
  commit: Commit;
}

export interface CommitListParams extends EntriesCursorParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * Whether to show commits in the given environment that have not been promoted to
   * the subsequent environment (false) or commits which have been promoted (true).
   */
  promoted?: boolean;

  /**
   * Filter commits by resource identifier. Must be used together with resource_type.
   * For most resources, this will be the resource key. In the case of translations,
   * this will be the locale code and namespace, separated by a `/`. For example,
   * `en/courses` or `en`.
   */
  resource_id?: string;

  /**
   * Filter commits by resource type. Must be used together with resource_id.
   */
  resource_type?:
    | 'dynamic_audience'
    | 'email_layout'
    | 'guide'
    | 'message_type'
    | 'partial'
    | 'translation'
    | 'workflow';
}

export interface CommitCommitAllParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * An optional message to include in a commit.
   */
  commit_message?: string;
}

export interface CommitPromoteAllParams {
  /**
   * A slug of the target environment to which you want to promote all changes from
   * its directly preceding environment.
   *
   * For example, if you have three environments “development”, “staging”, and
   * “production” (in that order), setting this param to “production” will promote
   * all commits not currently in production from staging.
   *
   * Note: This must be a non-development environment.
   */
  to_environment: string;
}

export declare namespace Commits {
  export {
    type Commit as Commit,
    type CommitCommitAllResponse as CommitCommitAllResponse,
    type CommitPromoteAllResponse as CommitPromoteAllResponse,
    type CommitPromoteOneResponse as CommitPromoteOneResponse,
    type CommitsEntriesCursor as CommitsEntriesCursor,
    type CommitListParams as CommitListParams,
    type CommitCommitAllParams as CommitCommitAllParams,
    type CommitPromoteAllParams as CommitPromoteAllParams,
  };
}
