import { NotFound } from 'http-errors';
import { describe, expect, it } from 'vitest';

import type { PaginatedResponse } from '../../../../types/api-responses';
import { formatReadResponse } from './format-read-response';

describe('formatReadResponse', () => {
  describe('single item requests', () => {
    it('should return first item wrapped in data property when data exists', () => {
      const data = [{ id: '1', name: 'Test' }];

      const result = formatReadResponse(data, {
        isSingleItemResult: true,
        isPaginated: false,
        objectName: 'Item',
      });

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify({ data: { id: '1', name: 'Test' } }),
      });
    });

    it('should throw NotFound when data is empty', () => {
      expect(() =>
        formatReadResponse([], {
          isSingleItemResult: true,
          isPaginated: false,
          objectName: 'Widget',
        })
      ).toThrow(NotFound);
    });

    it('should include object name in NotFound error message', () => {
      expect(() =>
        formatReadResponse([], {
          isSingleItemResult: true,
          isPaginated: false,
          objectName: 'CustomObject',
        })
      ).toThrow('CustomObject not found');
    });
  });

  describe('paginated list requests', () => {
    it('should return paginated response with page metadata', () => {
      const data = [{ id: '1' }, { id: '2' }, { id: '3' }];

      const result = formatReadResponse(data, {
        isSingleItemResult: false,
        isPaginated: true,
        pagination: { limit: 2, offset: 0 },
        objectName: 'Items',
      });

      const body: PaginatedResponse<{ id: string }> = JSON.parse(result.body);
      expect(result.statusCode).toBe(200);
      expect(body.data).toEqual([{ id: '1' }, { id: '2' }]);
      expect(body.pageMetadata).toEqual({
        hasNextPage: true,
        hasPreviousPage: false,
        nextCursor: 2,
        previousCursor: null,
      });
    });

    it('should handle pagination with offset', () => {
      const data = [{ id: '1' }, { id: '2' }, { id: '3' }];

      const result = formatReadResponse(data, {
        isSingleItemResult: false,
        isPaginated: true,
        pagination: { limit: 2, offset: 1 },
        objectName: 'Items',
      });

      const body: PaginatedResponse<{ id: string }> = JSON.parse(result.body);
      expect(body.data).toEqual([{ id: '2' }, { id: '3' }]);
      expect(body.pageMetadata.hasPreviousPage).toBe(true);
      expect(body.pageMetadata.hasNextPage).toBe(false);
    });

    it('should return empty data array when no results match pagination', () => {
      const result = formatReadResponse([], {
        isSingleItemResult: false,
        isPaginated: true,
        pagination: { limit: 10, offset: 0 },
        objectName: 'Items',
      });

      const body: PaginatedResponse<unknown> = JSON.parse(result.body);
      expect(body.data).toEqual([]);
      expect(body.pageMetadata.hasNextPage).toBe(false);
      expect(body.pageMetadata.hasPreviousPage).toBe(false);
    });
  });

  describe('non-paginated list requests', () => {
    it('should return all data wrapped in data property', () => {
      const data = [{ id: '1' }, { id: '2' }];

      const result = formatReadResponse(data, {
        isSingleItemResult: false,
        isPaginated: false,
        objectName: 'Items',
      });

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify({ data: [{ id: '1' }, { id: '2' }] }),
      });
    });

    it('should return empty array when no data exists', () => {
      const result = formatReadResponse([], {
        isSingleItemResult: false,
        isPaginated: false,
        objectName: 'Items',
      });

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify({ data: [] }),
      });
    });
  });
});
