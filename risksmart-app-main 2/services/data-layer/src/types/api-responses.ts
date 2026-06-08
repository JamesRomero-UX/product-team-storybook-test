/**
 * Standard API response envelope for successful responses
 */
export interface ApiResponse<T> {
  /**
   * Response data (null if not found)
   */
  data: T | null;

  /**
   * Error information (only present on errors)
   */
  error?: {
    /**
     * Human-readable error message
     */
    message: string;

    /**
     * Error code for programmatic handling
     */
    code: string;
  };
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
  /**
   * Array of data items for current page
   */
  data: T[];

  /**
   * Pagination metadata
   */
  pageMetadata: {
    /**
     * Whether there are more results after this page
     */
    hasNextPage: boolean;

    /**
     * Whether there are results before this page
     */
    hasPreviousPage: boolean;

    /**
     * Cursor for fetching next page (null if no next page)
     */
    nextCursor: number | null;

    /**
     * Cursor for fetching previous page (null if no previous page)
     */
    previousCursor: number | null;
  };
}
