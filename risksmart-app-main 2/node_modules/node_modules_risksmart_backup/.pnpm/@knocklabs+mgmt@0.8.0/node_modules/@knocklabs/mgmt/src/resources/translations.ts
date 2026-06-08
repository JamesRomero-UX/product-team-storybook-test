// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { EntriesCursor, type EntriesCursorParams, PagePromise } from '../core/pagination';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Translations extends APIResource {
  /**
   * Retrieve a translation by its locale and namespace, in a given environment.
   *
   * @example
   * ```ts
   * const translation = await client.translations.retrieve(
   *   'locale_code',
   *   { environment: 'development' },
   * );
   * ```
   */
  retrieve(
    localeCode: string,
    query: TranslationRetrieveParams,
    options?: RequestOptions,
  ): APIPromise<TranslationRetrieveResponse> {
    return this._client.get(path`/v1/translations/${localeCode}`, { query, ...options });
  }

  /**
   * Returns a paginated list of translations available in a given environment. The
   * translations are returned in alphabetical order by locale code.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const translation of client.translations.list({
   *   environment: 'development',
   * })) {
   *   // ...
   * }
   * ```
   */
  list(
    query: TranslationListParams,
    options?: RequestOptions,
  ): PagePromise<TranslationsEntriesCursor, Translation> {
    return this._client.getAPIList('/v1/translations', EntriesCursor<Translation>, { query, ...options });
  }

  /**
   * Updates a translation of a given locale code + namespace, or creates a new one
   * if it does not yet exist.
   *
   * Note: this endpoint only operates on translations in the "development"
   * environment.
   *
   * @example
   * ```ts
   * const response = await client.translations.upsert(
   *   'locale_code',
   *   {
   *     environment: 'development',
   *     namespace: 'namespace',
   *     translation: {
   *       content: '{"hello":"Hello, world!"}',
   *       format: 'json',
   *     },
   *   },
   * );
   * ```
   */
  upsert(
    localeCode: string,
    params: TranslationUpsertParams,
    options?: RequestOptions,
  ): APIPromise<TranslationUpsertResponse> {
    const { environment, namespace, annotate, commit, commit_message, format, ...body } = params;
    return this._client.put(path`/v1/translations/${localeCode}`, {
      query: { environment, namespace, annotate, commit, commit_message, format },
      body,
      ...options,
    });
  }

  /**
   * Validates a translation payload without persisting it.
   *
   * Note: this endpoint only operates on translations in the "development"
   * environment.
   *
   * @example
   * ```ts
   * const response = await client.translations.validate(
   *   'locale_code',
   *   {
   *     environment: 'development',
   *     translation: {
   *       content: '{"hello":"Hello, world!"}',
   *       format: 'json',
   *     },
   *   },
   * );
   * ```
   */
  validate(
    localeCode: string,
    params: TranslationValidateParams,
    options?: RequestOptions,
  ): APIPromise<TranslationValidateResponse> {
    const { environment, ...body } = params;
    return this._client.put(path`/v1/translations/${localeCode}/validate`, {
      query: { environment },
      body,
      ...options,
    });
  }
}

export type TranslationsEntriesCursor = EntriesCursor<Translation>;

/**
 * A translation object.
 */
export interface Translation {
  /**
   * A JSON encoded string containing the key-value pairs of translation references
   * and translation strings.
   */
  content: string;

  /**
   * Indicates whether content is a JSON encoded object string or a string in the PO
   * format.
   */
  format: 'json' | 'po';

  /**
   * The timestamp of when the translation was created.
   */
  inserted_at: string;

  /**
   * The locale code for the translation object.
   */
  locale_code: string;

  /**
   * An optional namespace for the translation to help categorize your translations.
   */
  namespace: string;

  /**
   * The timestamp of when the translation was last updated.
   */
  updated_at: string;
}

/**
 * Wraps the Translation response under the `translation` key.
 */
export interface TranslationRetrieveResponse {
  /**
   * A translation object.
   */
  translation: Translation;
}

/**
 * Wraps the Translation response under the `translation` key.
 */
export interface TranslationUpsertResponse {
  /**
   * A translation object.
   */
  translation: Translation;
}

/**
 * Wraps the Translation response under the `translation` key.
 */
export interface TranslationValidateResponse {
  /**
   * A translation object.
   */
  translation: Translation;
}

export interface TranslationRetrieveParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Optionally specify the returned content format. Supports 'json' and 'po'.
   * Defaults to 'json'.
   */
  format?: 'json' | 'po';

  /**
   * Whether to hide uncommitted changes. When true, only committed changes will be
   * returned. When false, both committed and uncommitted changes will be returned.
   */
  hide_uncommitted_changes?: boolean;

  /**
   * A specific namespace to filter translations for.
   */
  namespace?: string;
}

export interface TranslationListParams extends EntriesCursorParams {
  /**
   * The environment slug.
   */
  environment: string;

  /**
   * Whether to annotate the resource. Only used in the Knock CLI.
   */
  annotate?: boolean;

  /**
   * Optionally specify the returned content format. Supports 'json' and 'po'.
   * Defaults to 'json'.
   */
  format?: 'json' | 'po';

  /**
   * Whether to hide uncommitted changes. When true, only committed changes will be
   * returned. When false, both committed and uncommitted changes will be returned.
   */
  hide_uncommitted_changes?: boolean;

  /**
   * A specific locale code to filter translations for.
   */
  locale_code?: string;

  /**
   * A specific namespace to filter translations for.
   */
  namespace?: string;
}

export interface TranslationUpsertParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Query param: An optional namespace that identifies the translation.
   */
  namespace: string;

  /**
   * Body param: A translation object with a content attribute used to update or
   * create a translation.
   */
  translation: TranslationUpsertParams.Translation;

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

  /**
   * Query param: Optionally specify the returned content format. Supports 'json' and
   * 'po'. Defaults to 'json'.
   */
  format?: 'json' | 'po';
}

export namespace TranslationUpsertParams {
  /**
   * A translation object with a content attribute used to update or create a
   * translation.
   */
  export interface Translation {
    /**
     * A JSON encoded string containing the key-value pairs of translation references
     * and translation strings.
     */
    content: string;

    /**
     * Indicates whether content is a JSON encoded object string or a string in the PO
     * format.
     */
    format: 'json' | 'po';
  }
}

export interface TranslationValidateParams {
  /**
   * Query param: The environment slug.
   */
  environment: string;

  /**
   * Body param: A translation object with a content attribute used to update or
   * create a translation.
   */
  translation: TranslationValidateParams.Translation;
}

export namespace TranslationValidateParams {
  /**
   * A translation object with a content attribute used to update or create a
   * translation.
   */
  export interface Translation {
    /**
     * A JSON encoded string containing the key-value pairs of translation references
     * and translation strings.
     */
    content: string;

    /**
     * Indicates whether content is a JSON encoded object string or a string in the PO
     * format.
     */
    format: 'json' | 'po';
  }
}

export declare namespace Translations {
  export {
    type Translation as Translation,
    type TranslationRetrieveResponse as TranslationRetrieveResponse,
    type TranslationUpsertResponse as TranslationUpsertResponse,
    type TranslationValidateResponse as TranslationValidateResponse,
    type TranslationsEntriesCursor as TranslationsEntriesCursor,
    type TranslationRetrieveParams as TranslationRetrieveParams,
    type TranslationListParams as TranslationListParams,
    type TranslationUpsertParams as TranslationUpsertParams,
    type TranslationValidateParams as TranslationValidateParams,
  };
}
