import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { RatingKey } from './types';
import type { RatingContext } from './useRating';
import { useRating } from './useRating';

// Mock i18n to control taxonomy data
vi.mock('react-i18next', () => ({
  useTranslation: (namespace?: string) => ({
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
            { color: '#008000', label: 'Effective', value: 3 },
            { color: '#0000ff', label: 'Highly Effective', value: 4 },
          ],
          likelihood: [
            { color: '#008000', label: 'Remote', value: 1 },
            { color: '#80ff00', label: 'Unlikely', value: 2 },
            { color: '#ffff00', label: 'Possible', value: 3 },
            { color: '#ff8000', label: 'Likely', value: 4 },
            { color: '#ff0000', label: 'Almost Certain', value: 5 },
          ],
          impact: [
            { color: '#008000', label: 'Insignificant', value: 1 },
            { color: '#80ff00', label: 'Minor', value: 2 },
            { color: '#ffff00', label: 'Moderate', value: 3 },
            { color: '#ff8000', label: 'Major', value: 4 },
            { color: '#ff0000', label: 'Catastrophic', value: 5 },
          ],
          document: [
            { color: '#ff0000', label: 'Document - Minimal', value: 1 },
            { color: '#ff8000', label: 'Document - Limited', value: 2 },
            { color: '#008000', label: 'Document - Adequate', value: 3 },
            { color: '#0000ff', label: 'Document - Comprehensive', value: 4 },
          ],
        };

        // Return taxonomy based on namespace and key
        if (namespace === 'internal_audit_ratings') {
          return internalAuditTaxonomy[key] || [];
        }

        return standardTaxonomy[key] || [];
      }

      return key;
    },
  }),
}));

describe('useRating - Context Tests', () => {
  describe('Standard context behavior', () => {
    it('should use standard ratings taxonomy when context is "standard"', () => {
      const { result } = renderHook(() =>
        useRating('priority', 'standard' as RatingContext)
      );

      expect(result.current.options).toEqual([
        { color: 'dark-green', label: 'Low', value: 1 },
        { color: 'orange', label: 'Medium', value: 2 },
        { color: 'dark-red', label: 'High', value: 3 },
      ]);
    });

    it('should use standard ratings taxonomy when no context is provided', () => {
      const { result } = renderHook(() => useRating('priority'));

      expect(result.current.options).toEqual([
        { color: 'dark-green', label: 'Low', value: 1 },
        { color: 'orange', label: 'Medium', value: 2 },
        { color: 'dark-red', label: 'High', value: 3 },
      ]);
    });
  });

  describe('Internal audit context behavior', () => {
    it('should use internal audit taxonomy when context is "internal_audit"', () => {
      const { result } = renderHook(() =>
        useRating('effectiveness', 'internal_audit' as RatingContext)
      );

      expect(result.current.options).toEqual([
        { color: '#ff0000', label: 'Ineffective', value: 1 },
        { color: '#ff8000', label: 'Partially Effective', value: 2 },
        { color: '#008000', label: 'Effective', value: 3 },
        { color: '#0000ff', label: 'Highly Effective', value: 4 },
      ]);
    });

    it('should use internal audit likelihood taxonomy', () => {
      const { result } = renderHook(() =>
        useRating('likelihood', 'internal_audit' as RatingContext)
      );

      expect(result.current.options).toEqual([
        { color: '#008000', label: 'Remote', value: 1 },
        { color: '#80ff00', label: 'Unlikely', value: 2 },
        { color: '#ffff00', label: 'Possible', value: 3 },
        { color: '#ff8000', label: 'Likely', value: 4 },
        { color: '#ff0000', label: 'Almost Certain', value: 5 },
      ]);
    });

    it('should use internal audit impact taxonomy with 5 options', () => {
      const { result } = renderHook(() =>
        useRating('impact', 'internal_audit' as RatingContext)
      );

      expect(result.current.options).toHaveLength(5);
      expect(result.current.options).toEqual([
        { color: '#008000', label: 'Insignificant', value: 1 },
        { color: '#80ff00', label: 'Minor', value: 2 },
        { color: '#ffff00', label: 'Moderate', value: 3 },
        { color: '#ff8000', label: 'Major', value: 4 },
        { color: '#ff0000', label: 'Catastrophic', value: 5 },
      ]);
    });

    it('should handle document rating type with internal audit context', () => {
      const { result } = renderHook(() =>
        useRating('document' as RatingKey, 'internal_audit' as RatingContext)
      );

      expect(result.current.options).toEqual([
        { color: '#ff0000', label: 'Document - Minimal', value: 1 },
        { color: '#ff8000', label: 'Document - Limited', value: 2 },
        { color: '#008000', label: 'Document - Adequate', value: 3 },
        { color: '#0000ff', label: 'Document - Comprehensive', value: 4 },
      ]);
    });
  });

  describe('Context comparison tests', () => {
    it('should return different taxonomies for same rating type in different contexts', () => {
      const { result: standardResult } = renderHook(() =>
        useRating('likelihood', 'standard' as RatingContext)
      );

      const { result: internalAuditResult } = renderHook(() =>
        useRating('likelihood', 'internal_audit' as RatingContext)
      );

      // Should have different labels
      expect(standardResult.current.options[0].label).toBe('Unlikely');
      expect(internalAuditResult.current.options[0].label).toBe('Remote');

      // Should have different lengths (3 vs 5)
      expect(standardResult.current.options).toHaveLength(3);
      expect(internalAuditResult.current.options).toHaveLength(5);
    });
  });
});
