import type { APIGatewayProxyResult } from 'aws-lambda';
import { NotFound } from 'http-errors';
import type { PaginationParams } from 'src/utils/pagination';
import { paginateResults } from 'src/utils/pagination';

/**
 * Format options for response building
 */
export interface FormatReadResponseOptions {
  isSingleItemResult: boolean;
  isPaginated: boolean;
  pagination?: PaginationParams;
  objectName: string;
}

/**
 * Format the HTTP response based on filtered data and options.
 */
export function formatReadResponse<TData>(
  filteredData: TData[],
  options: FormatReadResponseOptions
): APIGatewayProxyResult {
  const { isSingleItemResult, isPaginated, pagination, objectName } = options;

  // Single item request (non-paginated, declared as single item)
  if (!isPaginated && isSingleItemResult) {
    if (filteredData.length === 0) {
      throw new NotFound(`${objectName} not found`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data: filteredData[0] }),
    };
  }

  // Paginated list request
  if (isPaginated && pagination) {
    return {
      statusCode: 200,
      body: JSON.stringify(paginateResults(filteredData, pagination)),
    };
  }

  // Non-paginated list request
  return {
    statusCode: 200,
    body: JSON.stringify({ data: filteredData }),
  };
}
