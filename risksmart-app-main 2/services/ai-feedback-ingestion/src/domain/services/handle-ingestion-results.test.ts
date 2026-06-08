import { beforeEach, describe, expect, it } from 'vitest';

import { ExternalServiceError, PartialFailureError } from '../errors';
import type { IngestionResult } from '../types';
import { handleIngestionResults } from './handle-ingestion-results';

describe('handleIngestionResults', () => {
  const mockFeedbackId = '550e8400-e29b-41d4-a716-446655440000';

  /**
   * Helper to assert that a function throws a specific error.
   */
  const expectToThrow = <T extends Error>(
    fn: () => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ErrorClass: new (...args: any[]) => T,
    assertions?: (error: T) => void
  ): void => {
    try {
      fn();
      // If we get here, the function didn't throw
      expect.fail('Expected function to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorClass);
      if (assertions) {
        assertions(error as T);
      }
    }
  };

  beforeEach(() => {
    // Reset any mocks if needed
  });

  describe('when all destinations succeed', () => {
    it('should not throw any error', () => {
      const results: IngestionResult[] = [
        { destination: 'storage', status: 'fulfilled' },
        { destination: 'observability', status: 'fulfilled' },
      ];

      expect(() =>
        handleIngestionResults(results, mockFeedbackId)
      ).not.toThrow();
    });
  });

  describe('when all destinations fail', () => {
    it('should throw ExternalServiceError with multiple service', () => {
      const storageError = new Error('Storage connection failed');
      const observabilityError = new Error('Observability API error');

      const results: IngestionResult[] = [
        { destination: 'storage', status: 'rejected', reason: storageError },
        {
          destination: 'observability',
          status: 'rejected',
          reason: observabilityError,
        },
      ];

      expectToThrow(
        () => handleIngestionResults(results, mockFeedbackId),
        ExternalServiceError,
        (error) => {
          expect(error.service).toBe('multiple');
          expect(error.message).toBe(
            'Failed to ingest feedback to all destinations'
          );
          expect(error.context).toMatchObject({
            feedbackId: mockFeedbackId,
            errors: [
              {
                service: 'storage',
                message: 'Storage connection failed',
              },
              {
                service: 'observability',
                message: 'Observability API error',
              },
            ],
          });
        }
      );
    });

    it('should handle non-Error rejection reasons', () => {
      const results: IngestionResult[] = [
        { destination: 'storage', status: 'rejected', reason: 'String error' },
        {
          destination: 'observability',
          status: 'rejected',
          reason: { code: 500 },
        },
      ];

      expectToThrow(
        () => handleIngestionResults(results, mockFeedbackId),
        ExternalServiceError,
        (error) => {
          expect(error.context).toMatchObject({
            feedbackId: mockFeedbackId,
            errors: [
              {
                service: 'storage',
                message: 'String error',
              },
              {
                service: 'observability',
                message: '[object Object]',
              },
            ],
          });
        }
      );
    });
  });

  describe('when storage fails but observability succeeds', () => {
    it('should throw PartialFailureError with correct succeeded/failed lists', () => {
      const storageError = new Error('Storage failed');

      const results: IngestionResult[] = [
        { destination: 'storage', status: 'rejected', reason: storageError },
        { destination: 'observability', status: 'fulfilled' },
      ];

      expectToThrow(
        () => handleIngestionResults(results, mockFeedbackId),
        PartialFailureError,
        (error) => {
          expect(error.succeeded).toEqual(['observability']);
          expect(error.failed).toEqual(['storage']);
          expect(error.message).toBe(
            'Feedback partially ingested - some destinations failed'
          );
          expect(error.context).toMatchObject({
            feedbackId: mockFeedbackId,
          });
          expect(error.context?.errors).toHaveLength(1);
          expect((error.context?.errors as unknown[])?.[0]).toMatchObject({
            service: 'storage',
            message: 'Storage failed',
            name: 'Error',
          });
        }
      );
    });
  });

  describe('when observability fails but storage succeeds', () => {
    it('should throw PartialFailureError with correct succeeded/failed lists', () => {
      const observabilityError = new Error('Observability API timeout');

      const results: IngestionResult[] = [
        { destination: 'storage', status: 'fulfilled' },
        {
          destination: 'observability',
          status: 'rejected',
          reason: observabilityError,
        },
      ];

      expectToThrow(
        () => handleIngestionResults(results, mockFeedbackId),
        PartialFailureError,
        (error) => {
          expect(error.succeeded).toEqual(['storage']);
          expect(error.failed).toEqual(['observability']);
          expect(error.context?.errors).toHaveLength(1);
          expect((error.context?.errors as unknown[])?.[0]).toMatchObject({
            service: 'observability',
            message: 'Observability API timeout',
            name: 'Error',
          });
        }
      );
    });
  });

  describe('with custom destination names', () => {
    it('should work with arbitrary destination identifiers', () => {
      const results: IngestionResult[] = [
        { destination: 'custom-storage-v2', status: 'fulfilled' },
        {
          destination: 'observability-platform',
          status: 'rejected',
          reason: new Error('Failed'),
        },
      ];

      expectToThrow(
        () => handleIngestionResults(results, mockFeedbackId),
        PartialFailureError,
        (error) => {
          expect(error.succeeded).toEqual(['custom-storage-v2']);
          expect(error.failed).toEqual(['observability-platform']);
        }
      );
    });
  });

  describe('with multiple destinations', () => {
    it('should handle more than two destinations', () => {
      const results: IngestionResult[] = [
        { destination: 'storage', status: 'fulfilled' },
        {
          destination: 'observability',
          status: 'rejected',
          reason: new Error('Observability failed'),
        },
        { destination: 'analytics', status: 'fulfilled' },
      ];

      expectToThrow(
        () => handleIngestionResults(results, mockFeedbackId),
        PartialFailureError,
        (error) => {
          expect(error.succeeded).toEqual(['storage', 'analytics']);
          expect(error.failed).toEqual(['observability']);
        }
      );
    });
  });
});
