// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class EmailLayouts extends APIResource {
  /**
   * Retrieve an email layout by its key, in a given environment.
   *
   * @example
   * ```ts
   * const emailLayout = await client.emailLayouts.retrieve(
   *   'email_layout_key',
   *   { environment: 'development' },
   * );
   * ```
   */
  retrieve(
    emailLayoutKey: string,
    query: EmailLayoutRetrieveParams,
    options?: RequestOptions,
  ): APIPromise<EmailLayout> {
    return this._client.get(path`/v1/email_layouts/${emailLayoutKey}`, { query, ...options });
  }

  /**
   * Returns a paginated list of email layouts available in a given environment.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const emailLayout of client.emailLayouts.list({
   *   environment: 'development',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(
    query: EmailLayoutListParams,
    options?: RequestOptions,
  ): PagePromise<EmailLayoutsEntriesCursor, EmailLayout> {
    return this._client.getAPIList('/v1/email_layouts', EntriesCursor<EmailLayout>, { query, ...options });
  }

  /**
   * Updates an email layout, or creates a new one if it does not yet exist.
   *
   * Note: this endpoint only operates in the "development" environment.
   *
   * @example
   * ```ts
   * const response = await client.emailLayouts.upsert(
   *   'email_layout_key',
   *   {
   *     environment: 'development',
   *     email_layout: {
   *       html_layout:
   *         '<html><body>Hello, world!</body></html>',
   *       name: 'Transactional',
   *       text_layout: 'Hello, world!',
   *     },
   *   },
   * );
   * ```
   */
  upsert(
    emailLayoutKey: string,
    params: EmailLayoutUpsertParams,
    options?: RequestOptions,
  ): APIPromise<EmailLayoutUpsertResponse> {
    const { environment, annotate, commit, commit_message, ...body } = params;
    return this._client.put(path`/v1/email_layouts/${emailLayoutKey}`, {
      query: { environment, annotate, commit, commit_message },
      body,
      ...options,
    });
  }

  /**
   * Validates an email layout payload without persisting it.
   *
   * Note: this endpoint only operates in the "development" environment.
   *
   * @example
   * ```ts
   * const response = await client.emailLayouts.validate(
   *   'email_layout_key',
   *   {
   *     environment: 'development',
   *     email_layout: {
   *       html_layout:
   *         '<html><body>Hello, world!</body></html>',
   *       name: 'Transactional',
   *       text_layout: 'Hello, world!',
   *     },
   *   },
   * );
   * ```
   */
  validate(
    emailLayoutKey: string,
    params: EmailLayoutValidateParams,
    options?: RequestOptions,
  ): APIPromise<EmailLayoutValidateResponse> {
    const { environment, ...body } = params;
    return this._client.put(path`/v1/email_layouts/${emailLayoutKey}/validate`, {
      query: { environment },
      body,
      ...options,
    });
  }
}

export type EmailLayoutsEntriesCursor = EntriesCursor<EmailLayout>;

/**
 * A versioned email layout used within an environment.
 */
export interface EmailLayout {
  /**
   * The timestamp of when the email layout was created.
   */
  created_at: string;

  /**
   * The complete HTML content of the email layout.
   */
  html_layout: string;

  /**
   * The unique key for this email layout.
   */
  key: string;

  /**
   * The human-readable name of this email layout.
   */
  name: string;

  /**
   * The SHA of the email layout.
   */
  sha: string;

  /**
   * The complete plaintext content of the email layout.
   */
  text_layout: string;

  /**
   * The environment of the email layout.
   */
  environment?: string;

  /**
   * A list of one or more items to show in the footer of the email layout.
   */
  footer_links?: Array<EmailLayout.FooterLink>;

  /**
   * The timestamp of when the email layout was last updated.
   */
  updated_at?: string;
}

export namespace EmailLayout {
  export interface FooterLink {
    /**
     * The text to display as the link.
     */
    text: string;

    /**
     * The URL to link to.
     */
    url: string;
  }
}

/**
 * Wraps the EmailLayout response under the `email_layout` key.
 */
export interface EmailLayoutUpsertResponse {
  /**
   * A versioned email layout used within an environment.
   */
  email_layout: EmailLayout;
}

/**
 * Wraps the EmailLayout response under the `email_layout` key.
 */
export interface EmailLayoutValidateResponse {
  /**
   * A versioned email layout used within an environment.
   */
  email_layout: EmailLayout;
}

export interface EmailLayoutRetrieveParams {
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

export interface EmailLayoutListParams extends EntriesCursorParams {
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

export interface EmailLayoutUpsertParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A request to update or create an email layout.
   */
  email_layout: EmailLayoutUpsertParams.EmailLayout;

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

export namespace EmailLayoutUpsertParams {
  /**
   * A request to update or create an email layout.
   */
  export interface EmailLayout {
    /**
     * The complete HTML content of the email layout.
     */
    html_layout: string;

    /**
     * The friendly name of this email layout.
     */
    name: string;

    /**
     * The complete plain text content of the email layout.
     */
    text_layout: string;

    /**
     * A list of one or more items to show in the footer of the email layout.
     */
    footer_links?: Array<EmailLayout.FooterLink>;
  }

  export namespace EmailLayout {
    export interface FooterLink {
      /**
       * The text to display as the link.
       */
      text: string;

      /**
       * The URL to link to.
       */
      url: string;
    }
  }
}

export interface EmailLayoutValidateParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A request to update or create an email layout.
   */
  email_layout: EmailLayoutValidateParams.EmailLayout;
}

export namespace EmailLayoutValidateParams {
  /**
   * A request to update or create an email layout.
   */
  export interface EmailLayout {
    /**
     * The complete HTML content of the email layout.
     */
    html_layout: string;

    /**
     * The friendly name of this email layout.
     */
    name: string;

    /**
     * The complete plain text content of the email layout.
     */
    text_layout: string;

    /**
     * A list of one or more items to show in the footer of the email layout.
     */
    footer_links?: Array<EmailLayout.FooterLink>;
  }

  export namespace EmailLayout {
    export interface FooterLink {
      /**
       * The text to display as the link.
       */
      text: string;

      /**
       * The URL to link to.
       */
      url: string;
    }
  }
}

export declare namespace EmailLayouts {
  export {
    type EmailLayout as EmailLayout,
    type EmailLayoutUpsertResponse as EmailLayoutUpsertResponse,
    type EmailLayoutValidateResponse as EmailLayoutValidateResponse,
    type EmailLayoutsEntriesCursor as EmailLayoutsEntriesCursor,
    type EmailLayoutRetrieveParams as EmailLayoutRetrieveParams,
    type EmailLayoutListParams as EmailLayoutListParams,
    type EmailLayoutUpsertParams as EmailLayoutUpsertParams,
    type EmailLayoutValidateParams as EmailLayoutValidateParams,
  };
}
