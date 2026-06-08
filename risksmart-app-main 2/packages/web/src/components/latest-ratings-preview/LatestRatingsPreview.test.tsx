import { render, screen } from '@testing-library/react';
import type { RatingKeys } from 'src/ratings/ratings';
import { describe, expect, it, vi } from 'vitest';

import type { ResultProps } from './LatestRatingsPreview';
import LatestRatingsPreview from './LatestRatingsPreview';

// Mock the i18n module to control taxonomy data
vi.mock('react-i18next', () => ({
  useTranslation: (namespace?: string | string[]) => ({
    t: (key: string, options?: { returnObjects?: boolean }) => {
      if (options?.returnObjects) {
        // Standard taxonomy
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

        // Internal audit taxonomy
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
}));

describe('LatestRatingsPreview', () => {
  const defaultResult: ResultProps = {
    id: '1',
    title: '',
    rating: undefined,
    ratingType: undefined,
    completionDate: undefined,
  };

  describe('Basic rendering', () => {
    it('renders each assessments title', () => {
      render(
        <LatestRatingsPreview
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Title 1',
            },
            {
              ...defaultResult,
              id: '2',
              title: 'Title 2',
            },
          ]}
        />
      );
      expect(screen.getByText('Title 1')).toBeInTheDocument();
      expect(screen.getByText('Title 2')).toBeInTheDocument();
    });
  });

  describe('Standard taxonomy rendering', () => {
    it('should render standard ratings when no ratingContext is provided', () => {
      render(
        <LatestRatingsPreview
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Standard Assessment',
              rating: 2,
              ratingType: 'priority',
            },
          ]}
        />
      );

      expect(screen.getByText('Standard Assessment')).toBeInTheDocument();
      // Should use standard priority taxonomy: Medium (value 2)
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should render standard ratings when ratingContext is explicitly "standard"', () => {
      render(
        <LatestRatingsPreview
          ratingContext={'standard'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Standard Assessment',
              rating: 3,
              ratingType: 'likelihood',
            },
          ]}
        />
      );

      expect(screen.getByText('Standard Assessment')).toBeInTheDocument();
      // Should use standard likelihood taxonomy: Likely (value 3)
      expect(screen.getByText('Likely')).toBeInTheDocument();
    });
  });

  describe('Internal audit taxonomy rendering', () => {
    it('should render internal audit ratings when ratingContext is "internal_audit"', () => {
      render(
        <LatestRatingsPreview
          ratingContext={'internal_audit'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Internal Audit Assessment',
              rating: 2,
              ratingType: 'effectiveness',
            },
          ]}
        />
      );

      expect(screen.getByText('Internal Audit Assessment')).toBeInTheDocument();
      // Should use internal audit effectiveness taxonomy: Partially Effective (value 2)
      expect(screen.getByText('Partially Effective')).toBeInTheDocument();
    });

    it('should render internal audit likelihood ratings differently from standard', () => {
      render(
        <LatestRatingsPreview
          ratingContext={'internal_audit'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Internal Audit Likelihood',
              rating: 1,
              ratingType: 'likelihood',
            },
          ]}
        />
      );

      expect(screen.getByText('Internal Audit Likelihood')).toBeInTheDocument();
      // Should use internal audit likelihood taxonomy: Low (value 1)
      // NOT standard likelihood taxonomy: Unlikely (value 1)
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });

  describe('Fallback behavior', () => {
    it('should fallback to standard taxonomy when internal audit taxonomy is not available', () => {
      render(
        <LatestRatingsPreview
          ratingContext={'internal_audit'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Fallback Test',
              rating: 2,
              ratingType: 'priority', // priority doesn't exist in internal audit taxonomy
            },
          ]}
        />
      );

      expect(screen.getByText('Fallback Test')).toBeInTheDocument();
      // Should fallback to standard priority taxonomy: Medium (value 2)
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });
  });

  describe('Mixed contexts in same component', () => {
    it('should render different taxonomies for same rating type based on context', () => {
      // Render two components side by side with different contexts
      const { rerender } = render(
        <LatestRatingsPreview
          ratingContext={'standard'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Standard Likelihood',
              rating: 1,
              ratingType: 'likelihood',
            },
          ]}
        />
      );

      // Standard context should show "Unlikely"
      expect(screen.getByText('Unlikely')).toBeInTheDocument();

      // Re-render with internal audit context
      rerender(
        <LatestRatingsPreview
          ratingContext={'internal_audit'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Internal Audit Likelihood',
              rating: 1,
              ratingType: 'likelihood',
            },
          ]}
        />
      );

      // Internal audit context should show "Low" (different from standard's "Unlikely")
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.queryByText('Unlikely')).not.toBeInTheDocument();
    });
  });

  describe('Empty states and edge cases', () => {
    it('should handle undefined rating gracefully', () => {
      render(
        <LatestRatingsPreview
          ratingContext={'internal_audit'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'No Rating',
              rating: undefined,
              ratingType: 'effectiveness',
            },
          ]}
        />
      );

      expect(screen.getByText('No Rating')).toBeInTheDocument();
      // Should not crash or show invalid rating text
    });

    it('should handle undefined ratingType gracefully', () => {
      render(
        <LatestRatingsPreview
          ratingContext={'internal_audit'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'No Rating Type',
              rating: 2,
              ratingType: undefined,
            },
          ]}
        />
      );

      expect(screen.getByText('No Rating Type')).toBeInTheDocument();
      // Should not crash
    });

    it('should handle non-existent rating type gracefully', () => {
      render(
        <LatestRatingsPreview
          ratingContext={'internal_audit'}
          assessmentResults={[
            {
              ...defaultResult,
              id: '1',
              title: 'Invalid Rating Type',
              rating: 2,
              ratingType: 'nonexistent' as RatingKeys,
            },
          ]}
        />
      );

      expect(screen.getByText('Invalid Rating Type')).toBeInTheDocument();
      // Should not crash
    });
  });
});
