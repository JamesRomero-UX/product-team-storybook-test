import type { APIGatewayProxyEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIMIT,
  extractPaginationParams,
  MAX_LIMIT,
  paginateResults,
} from './pagination';

describe('pagination utility', () => {
  describe('extractPaginationParams', () => {
    const createMockEvent = (
      queryStringParameters: Record<string, string> | null
    ): APIGatewayProxyEvent =>
      ({
        queryStringParameters,
      }) as APIGatewayProxyEvent;

    it('should return default values when no query params', () => {
      const event = createMockEvent(null);
      const result = extractPaginationParams(event);

      expect(result).toEqual({
        limit: DEFAULT_LIMIT,
        offset: 0,
      });
    });

    it('should parse limit and offset from query params', () => {
      const event = createMockEvent({ limit: '20', offset: '100' });
      const result = extractPaginationParams(event);

      expect(result).toEqual({
        limit: 20,
        offset: 100,
      });
    });

    it('should cap limit at MAX_LIMIT', () => {
      const event = createMockEvent({ limit: '10000' });
      const result = extractPaginationParams(event);

      expect(result.limit).toBe(MAX_LIMIT);
    });

    it('should use default limit for invalid limit value', () => {
      const event = createMockEvent({ limit: 'invalid' });
      const result = extractPaginationParams(event);

      expect(result.limit).toBe(DEFAULT_LIMIT);
    });

    it('should use default limit for negative limit value', () => {
      const event = createMockEvent({ limit: '-5' });
      const result = extractPaginationParams(event);

      expect(result.limit).toBe(DEFAULT_LIMIT);
    });

    it('should use 0 offset for invalid offset value', () => {
      const event = createMockEvent({ offset: 'invalid' });
      const result = extractPaginationParams(event);

      expect(result.offset).toBe(0);
    });

    it('should use 0 offset for negative offset value', () => {
      const event = createMockEvent({ offset: '-10' });
      const result = extractPaginationParams(event);

      expect(result.offset).toBe(0);
    });
  });

  describe('paginateResults', () => {
    const testItems = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));

    it('should return first page correctly', () => {
      const result = paginateResults(testItems, { limit: 10, offset: 0 });

      expect(result.data).toHaveLength(10);
      expect(result.data[0]?.id).toBe(1);
      expect(result.data[9]?.id).toBe(10);
      expect(result.pageMetadata).toEqual({
        hasNextPage: true,
        hasPreviousPage: false,
        nextCursor: 10,
        previousCursor: null,
      });
    });

    it('should return middle page correctly', () => {
      const result = paginateResults(testItems, { limit: 10, offset: 50 });

      expect(result.data).toHaveLength(10);
      expect(result.data[0]?.id).toBe(51);
      expect(result.data[9]?.id).toBe(60);
      expect(result.pageMetadata).toEqual({
        hasNextPage: true,
        hasPreviousPage: true,
        nextCursor: 60,
        previousCursor: 40,
      });
    });

    it('should return last page correctly', () => {
      const result = paginateResults(testItems, { limit: 10, offset: 90 });

      expect(result.data).toHaveLength(10);
      expect(result.data[0]?.id).toBe(91);
      expect(result.data[9]?.id).toBe(100);
      expect(result.pageMetadata).toEqual({
        hasNextPage: false,
        hasPreviousPage: true,
        nextCursor: null,
        previousCursor: 80,
      });
    });

    it('should handle partial last page', () => {
      const result = paginateResults(testItems, { limit: 15, offset: 90 });

      expect(result.data).toHaveLength(10);
      expect(result.data[0]?.id).toBe(91);
      expect(result.pageMetadata.hasNextPage).toBe(false);
    });

    it('should handle empty results', () => {
      const result = paginateResults([], { limit: 10, offset: 0 });

      expect(result.data).toHaveLength(0);
      expect(result.pageMetadata).toEqual({
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        previousCursor: null,
      });
    });

    it('should handle offset beyond results', () => {
      const result = paginateResults(testItems, { limit: 10, offset: 200 });

      expect(result.data).toHaveLength(0);
      expect(result.pageMetadata).toEqual({
        hasNextPage: false,
        hasPreviousPage: true,
        nextCursor: null,
        previousCursor: 190,
      });
    });

    it('should calculate previousCursor correctly when offset is less than limit', () => {
      const result = paginateResults(testItems, { limit: 20, offset: 10 });

      expect(result.pageMetadata.previousCursor).toBe(0);
    });
  });
});
