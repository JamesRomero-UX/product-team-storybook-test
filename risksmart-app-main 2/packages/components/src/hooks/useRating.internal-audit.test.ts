import { renderHook } from '@testing-library/react';
import type * as ReactI18next from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';

import { getWrapper } from '../testing/wrapper';
import type { RatingKey } from './types';
import { useRating } from './useRating';

// Mock i18n to control taxonomy data
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactI18next>();

  return {
    ...actual,
    useTranslation: (namespace?: string | string[]) => ({
      t: (key: string, options?: { returnObjects?: boolean }) => {
        if (options?.returnObjects) {
          // Simulate both standard and internal audit taxonomies
          const standardTaxonomy: Record<
            string,
            Array<{ color: string; label: string; value: number }>
          > = {
            priority: [
              { color: 'dark-green', label: 'Low', value: 1 },
              { color: 'orange', label: 'Medium', value: 2 },
              { color: 'dark-red', label: 'High', value: 3 },
            ],
            likelihood: [
              { color: 'green', label: 'Unlikely', value: 1 },
              { color: 'yellow', label: 'Possible', value: 2 },
              { color: 'red', label: 'Likely', value: 3 },
            ],
          };

          const internalAuditTaxonomy: Record<
            string,
            Array<{ color: string; label: string; value: number }>
          > = {
            effectiveness: [
              { color: '#ff0000', label: 'Ineffective', value: 1 },
              { color: '#ff8000', label: 'Partially Effective', value: 2 },
              { color: '#00ff00', label: 'Effective', value: 3 },
            ],
            likelihood: [
              { color: '#00ff00', label: 'Low', value: 1 },
              { color: '#ff8000', label: 'Medium', value: 2 },
              { color: '#ff0000', label: 'High', value: 3 },
            ],
            impact: [
              { color: '#00ff00', label: 'Very Low', value: 1 },
              { color: '#80ff00', label: 'Low', value: 2 },
              { color: '#ff8000', label: 'Medium', value: 3 },
              { color: '#ff4000', label: 'High', value: 4 },
              { color: '#ff0000', label: 'Very High', value: 5 },
            ],
          };

          // Return taxonomy based on namespace passed to useTranslation
          if (namespace === 'internal_audit_ratings') {
            return internalAuditTaxonomy[key] || [];
          }

          // Return standard taxonomy (default or 'ratings' namespace)
          return standardTaxonomy[key] || [];
        }

        return `mocked:${key}`;
      },
    }),
  };
});

describe('useRating - Internal Audit Context Tests', () => {
  describe('Standard context behavior', () => {
    it('should use standard ratings taxonomy when context is "standard"', () => {
      const { result } = renderHook(() => useRating('likelihood', 'standard'), {
        wrapper: getWrapper('i18n'),
      });

      const options = result.current.options;

      expect(options).toEqual([
        { color: 'green', label: 'Unlikely', value: 1 },
        { color: 'yellow', label: 'Possible', value: 2 },
        { color: 'red', label: 'Likely', value: 3 },
      ]);
    });

    it('should use standard ratings taxonomy when no context is provided', () => {
      const { result } = renderHook(() => useRating('priority'), {
        wrapper: getWrapper('i18n'),
      });

      const options = result.current.options;

      expect(options).toEqual([
        { color: 'dark-green', label: 'Low', value: 1 },
        { color: 'orange', label: 'Medium', value: 2 },
        { color: 'dark-red', label: 'High', value: 3 },
      ]);
    });
  });

  describe('Internal audit context behavior', () => {
    it('should use internal audit taxonomy when context is "internal_audit"', () => {
      const { result } = renderHook(
        () => useRating('effectiveness', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const options = result.current.options;

      expect(options).toEqual([
        { color: '#ff0000', label: 'Ineffective', value: 1 },
        { color: '#ff8000', label: 'Partially Effective', value: 2 },
        { color: '#00ff00', label: 'Effective', value: 3 },
      ]);
    });

    it('should use internal audit likelihood taxonomy', () => {
      const { result } = renderHook(
        () => useRating('likelihood', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const options = result.current.options;

      expect(options).toEqual([
        { color: '#00ff00', label: 'Low', value: 1 },
        { color: '#ff8000', label: 'Medium', value: 2 },
        { color: '#ff0000', label: 'High', value: 3 },
      ]);
    });

    it('should use internal audit impact taxonomy with 5 options', () => {
      const { result } = renderHook(
        () => useRating('impact', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const options = result.current.options;

      expect(options).toHaveLength(5);
      expect(options).toEqual([
        { color: '#00ff00', label: 'Very Low', value: 1 },
        { color: '#80ff00', label: 'Low', value: 2 },
        { color: '#ff8000', label: 'Medium', value: 3 },
        { color: '#ff4000', label: 'High', value: 4 },
        { color: '#ff0000', label: 'Very High', value: 5 },
      ]);
    });
  });

  describe('Fallback behavior', () => {
    it('should fallback to standard taxonomy when internal audit taxonomy is not available', () => {
      const { result } = renderHook(
        () => useRating('priority', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const options = result.current.options;

      // Should fallback to standard priority ratings since internal audit doesn't have priority
      expect(options).toEqual([
        { color: 'dark-green', label: 'Low', value: 1 },
        { color: 'orange', label: 'Medium', value: 2 },
        { color: 'dark-red', label: 'High', value: 3 },
      ]);
    });

    it('should return empty array when neither taxonomy is available', () => {
      const { result } = renderHook(
        () => useRating('nonexistent' as RatingKey, 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const options = result.current.options;

      expect(options).toEqual([]);
    });
  });

  describe('Utility methods with internal audit context', () => {
    it('should get rating by value from internal audit taxonomy', () => {
      const { result } = renderHook(
        () => useRating('effectiveness', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const rating = result.current.getByValue(2);

      expect(rating).toEqual({
        color: '#ff8000',
        label: 'Partially Effective',
        value: 2,
      });
    });

    it('should get rating by label from internal audit taxonomy', () => {
      const { result } = renderHook(
        () => useRating('effectiveness', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const rating = result.current.getByLabel('Effective');

      expect(rating).toEqual({
        color: '#00ff00',
        label: 'Effective',
        value: 3,
      });
    });

    it('should get label by value from internal audit taxonomy', () => {
      const { result } = renderHook(
        () => useRating('effectiveness', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const label = result.current.getLabel(1);

      expect(label).toBe('Ineffective');
    });
  });

  describe('Context comparison tests', () => {
    it('should return different taxonomies for same rating type in different contexts', () => {
      const { result: standardResult } = renderHook(
        () => useRating('likelihood', 'standard'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const { result: internalAuditResult } = renderHook(
        () => useRating('likelihood', 'internal_audit'),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      // Standard likelihood taxonomy
      expect(standardResult.current.options).toEqual([
        { color: 'green', label: 'Unlikely', value: 1 },
        { color: 'yellow', label: 'Possible', value: 2 },
        { color: 'red', label: 'Likely', value: 3 },
      ]);

      // Internal audit likelihood taxonomy (different labels)
      expect(internalAuditResult.current.options).toEqual([
        { color: '#00ff00', label: 'Low', value: 1 },
        { color: '#ff8000', label: 'Medium', value: 2 },
        { color: '#ff0000', label: 'High', value: 3 },
      ]);

      // Ensure they are different
      expect(standardResult.current.options).not.toEqual(
        internalAuditResult.current.options
      );
    });
  });
});
