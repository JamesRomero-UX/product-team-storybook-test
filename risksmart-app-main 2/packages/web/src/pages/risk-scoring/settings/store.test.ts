import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ScoringSettingsData } from './store';
import { useInternalStore } from './store';

const createTestData = (
  overrides?: Partial<ScoringSettingsData>
): ScoringSettingsData => ({
  likelihoodLevels: [
    { value: 1, title: 'Low', description: 'Low likelihood', color: '#79B250' },
    {
      value: 2,
      title: 'Medium',
      description: 'Medium likelihood',
      color: '#F2A041',
    },
    {
      value: 3,
      title: 'High',
      description: 'High likelihood',
      color: '#D25F5F',
    },
  ],
  impactLevels: [
    { value: 1, title: 'Minor', description: 'Minor impact', color: '#79B250' },
    {
      value: 2,
      title: 'Moderate',
      description: 'Moderate impact',
      color: '#F2A041',
    },
    {
      value: 3,
      title: 'Major',
      description: 'Major impact',
      color: '#D25F5F',
    },
  ],
  impactCategories: [
    { name: 'Financial', color: '#474771' },
    { name: 'Operational', color: '#79B250' },
  ],
  impactAggregation: 'average',
  matrix: [
    {
      likelihood: 1,
      impact: 1,
      title: 'Very Low',
      value: 1,
      color: '#79B250',
    },
    {
      likelihood: 1,
      impact: 2,
      title: 'Low',
      value: 2,
      color: '#A8D08C',
    },
    {
      likelihood: 2,
      impact: 1,
      title: 'Low',
      value: 2,
      color: '#A8D08C',
    },
    {
      likelihood: 2,
      impact: 2,
      title: 'Medium',
      value: 4,
      color: '#F2A041',
    },
  ],
  id: 'test-id',
  originalTimestamp: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('useInternalStore', () => {
  beforeEach(() => {
    act(() => {
      useInternalStore.getState().reset();
    });
  });

  describe('updateLikelihoodLevel', () => {
    it('updates level matched by original value', () => {
      act(() => {
        useInternalStore.getState().hydrate(createTestData());
      });

      act(() => {
        useInternalStore.getState().updateLikelihoodLevel(2, {
          value: 2,
          title: 'Updated Medium',
          description: 'Updated',
          color: '#000000',
        });
      });

      const levels = useInternalStore.getState().current!.likelihoodLevels;
      expect(levels.find((l) => l.value === 2)?.title).toBe('Updated Medium');
    });

    it('remaps matrix likelihood entries when value changes', () => {
      act(() => {
        useInternalStore.getState().hydrate(createTestData());
      });

      act(() => {
        useInternalStore.getState().updateLikelihoodLevel(2, {
          value: 5,
          title: 'Medium',
          description: 'Medium likelihood',
          color: '#F2A041',
        });
      });

      const { likelihoodLevels, matrix } = useInternalStore.getState().current!;

      // Level value should be updated
      expect(likelihoodLevels.find((l) => l.value === 5)).toBeTruthy();
      expect(likelihoodLevels.find((l) => l.value === 2)).toBeUndefined();

      // Matrix entries that had likelihood=2 should now have likelihood=5
      const remappedEntries = matrix.filter((e) => e.likelihood === 5);
      expect(remappedEntries).toHaveLength(2);

      // No entries should still reference the old value
      const oldEntries = matrix.filter((e) => e.likelihood === 2);
      expect(oldEntries).toHaveLength(0);
    });

    it('does not touch matrix when value is unchanged', () => {
      const data = createTestData();
      act(() => {
        useInternalStore.getState().hydrate(data);
      });

      act(() => {
        useInternalStore.getState().updateLikelihoodLevel(1, {
          value: 1,
          title: 'Renamed Low',
          description: 'Low likelihood',
          color: '#79B250',
        });
      });

      const { matrix } = useInternalStore.getState().current!;
      expect(matrix).toBe(data.matrix);
    });
  });

  describe('updateImpactLevel', () => {
    it('updates level matched by original value', () => {
      act(() => {
        useInternalStore.getState().hydrate(createTestData());
      });

      act(() => {
        useInternalStore.getState().updateImpactLevel(2, {
          value: 2,
          title: 'Updated Moderate',
          description: 'Updated',
          color: '#000000',
        });
      });

      const levels = useInternalStore.getState().current!.impactLevels;
      expect(levels.find((l) => l.value === 2)?.title).toBe('Updated Moderate');
    });

    it('remaps matrix impact entries when value changes', () => {
      act(() => {
        useInternalStore.getState().hydrate(createTestData());
      });

      act(() => {
        useInternalStore.getState().updateImpactLevel(2, {
          value: 7,
          title: 'Moderate',
          description: 'Moderate impact',
          color: '#F2A041',
        });
      });

      const { impactLevels, matrix } = useInternalStore.getState().current!;

      expect(impactLevels.find((l) => l.value === 7)).toBeTruthy();
      expect(impactLevels.find((l) => l.value === 2)).toBeUndefined();

      const remappedEntries = matrix.filter((e) => e.impact === 7);
      expect(remappedEntries).toHaveLength(2);

      const oldEntries = matrix.filter((e) => e.impact === 2);
      expect(oldEntries).toHaveLength(0);
    });
  });

  describe('confirmEditLevel', () => {
    it('uses original value when confirming likelihood edit', () => {
      act(() => {
        useInternalStore.getState().hydrate(createTestData());
      });

      act(() => {
        useInternalStore.getState().setEditingLevel({
          type: 'likelihood',
          level: {
            value: 1,
            title: 'Low',
            description: 'Low likelihood',
            color: '#79B250',
          },
        });
      });

      act(() => {
        useInternalStore.getState().confirmEditLevel({
          value: 10,
          title: 'Very Low',
          description: 'Very low likelihood',
          color: '#79B250',
        });
      });

      const { likelihoodLevels, matrix } = useInternalStore.getState().current!;

      // Level should be updated with new value
      expect(likelihoodLevels.find((l) => l.value === 10)?.title).toBe(
        'Very Low'
      );
      expect(likelihoodLevels.find((l) => l.value === 1)).toBeUndefined();

      // Matrix should be remapped
      expect(matrix.filter((e) => e.likelihood === 10)).toHaveLength(2);
      expect(matrix.filter((e) => e.likelihood === 1)).toHaveLength(0);

      // Editing state should be cleared
      expect(useInternalStore.getState().editingLevel).toBeNull();
    });

    it('uses original value when confirming impact edit', () => {
      act(() => {
        useInternalStore.getState().hydrate(createTestData());
      });

      act(() => {
        useInternalStore.getState().setEditingLevel({
          type: 'impact',
          level: {
            value: 1,
            title: 'Minor',
            description: 'Minor impact',
            color: '#79B250',
          },
        });
      });

      act(() => {
        useInternalStore.getState().confirmEditLevel({
          value: 10,
          title: 'Negligible',
          description: 'Negligible impact',
          color: '#79B250',
        });
      });

      const { impactLevels, matrix } = useInternalStore.getState().current!;

      expect(impactLevels.find((l) => l.value === 10)?.title).toBe(
        'Negligible'
      );
      expect(impactLevels.find((l) => l.value === 1)).toBeUndefined();

      expect(matrix.filter((e) => e.impact === 10)).toHaveLength(2);
      expect(matrix.filter((e) => e.impact === 1)).toHaveLength(0);
    });
  });
});
