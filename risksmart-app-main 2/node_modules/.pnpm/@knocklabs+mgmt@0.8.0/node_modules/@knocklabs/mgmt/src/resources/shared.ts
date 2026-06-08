// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

/**
 * The information about a paginated result.
 */
export interface PageInfo {
  /**
   * The number of entries to fetch per-page.
   */
  page_size: number;

  /**
   * The cursor to fetch entries after. Will only be present if there are more
   * entries to fetch.
   */
  after?: string | null;

  /**
   * The cursor to fetch entries before. Will only be present if there are more
   * entries to fetch before the current page.
   */
  before?: string | null;
}
