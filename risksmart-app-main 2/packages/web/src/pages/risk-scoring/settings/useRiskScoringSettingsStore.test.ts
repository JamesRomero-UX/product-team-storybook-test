import { act, renderHook } from '@testing-library/react';
import { useGetLatestRiskAssessmentResultConfig } from 'src/hooks/queries';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { useInternalStore } from './store';
import { useRiskScoringSettingsStore } from './useRiskScoringSettingsStore';

vi.mock('src/hooks/queries', () => ({
  useGetLatestRiskAssessmentResultConfig: vi.fn(),
}));

describe('useRiskScoringSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset internal store between tests
    useInternalStore.getState().reset();
  });

  const mockQueryLoading = () => {
    const mockQuery = useGetLatestRiskAssessmentResultConfig as Mock;
    mockQuery.mockReturnValue({
      config: undefined,
      loading: true,
    });
  };

  const mockQueryWithData = (config: {
    likelihood?: { ratings: unknown[] };
    impact?: {
      ratings?: unknown[];
      categories?: unknown[];
      aggregation?: 'average' | 'maximum';
    };
    matrix?: unknown[];
  }) => {
    const mockQuery = useGetLatestRiskAssessmentResultConfig as Mock;
    mockQuery.mockReturnValue({
      config: {
        likelihood: { ratings: [] },
        impact: { ratings: [], categories: [], aggregation: 'average' },
        matrix: [],
        ...config,
      },
      loading: false,
      id: 'test-id',
      originalTimestamp: '2024-01-01T00:00:00Z',
    });
  };

  describe('initialization', () => {
    it('shows loading state while data fetches', () => {
      mockQueryLoading();
      const { result } = renderHook(() => useRiskScoringSettingsStore());
      expect(result.current.isLoading).toBe(true);
    });

    it('initializes with empty state before hydration', () => {
      mockQueryLoading();
      const { result } = renderHook(() => useRiskScoringSettingsStore());
      expect(result.current.state.likelihoodLevels).toEqual([]);
      expect(result.current.state.impactLevels).toEqual([]);
      expect(result.current.state.impactCategories).toEqual([]);
      expect(result.current.state.matrix).toEqual([]);
    });
  });

  describe('hydration', () => {
    it('hydrates with API data', () => {
      mockQueryWithData({
        likelihood: {
          ratings: [
            {
              value: 1,
              title: 'Low',
              description: 'Low risk',
              color: '#9CA3AF',
            },
            {
              value: 2,
              title: 'High',
              description: 'High risk',
              color: '#EF4444',
            },
          ],
        },
      });

      const { result } = renderHook(() => useRiskScoringSettingsStore());

      expect(result.current.state.likelihoodLevels).toHaveLength(2);
      expect(result.current.state.likelihoodLevels[0]).toEqual({
        value: 1,
        title: 'Low',
        description: 'Low risk',
        color: '#9CA3AF', // Hex color from DB (no transformation)
      });
    });

    it('sorts levels by rating ascending', () => {
      mockQueryWithData({
        likelihood: {
          ratings: [
            { value: 3, title: 'High', description: '', color: '#EF4444' },
            { value: 1, title: 'Low', description: '', color: '#10B981' },
            { value: 2, title: 'Medium', description: '', color: '#F59E0B' },
          ],
        },
      });

      const { result } = renderHook(() => useRiskScoringSettingsStore());

      expect(result.current.state.likelihoodLevels[0].value).toBe(1);
      expect(result.current.state.likelihoodLevels[1].value).toBe(2);
      expect(result.current.state.likelihoodLevels[2].value).toBe(3);
    });

    it('handles null description by converting to empty string', () => {
      mockQueryWithData({
        likelihood: {
          ratings: [
            {
              value: 1,
              title: 'Low',
              description: null,
              color: '#9CA3AF',
            },
          ],
        },
      });

      const { result } = renderHook(() => useRiskScoringSettingsStore());

      expect(result.current.state.likelihoodLevels[0].description).toBe('');
    });

    it('sets initial for change detection', () => {
      mockQueryWithData({
        likelihood: {
          ratings: [
            { value: 1, title: 'Low', description: '', color: '#9CA3AF' },
          ],
        },
      });

      renderHook(() => useRiskScoringSettingsStore());

      const internalState = useInternalStore.getState();
      expect(internalState.initial).not.toBeNull();
      expect(internalState.initial?.likelihoodLevels).toHaveLength(1);
    });

    it('hydrates impact levels', () => {
      mockQueryWithData({
        impact: {
          ratings: [
            {
              value: 1,
              title: 'Minor',
              description: 'Minor impact',
              color: '#3B82F6',
            },
            {
              value: 2,
              title: 'Major',
              description: 'Major impact',
              color: '#F97316',
            },
          ],
          categories: [],
        },
      });

      const { result } = renderHook(() => useRiskScoringSettingsStore());

      expect(result.current.state.impactLevels).toHaveLength(2);
      expect(result.current.state.impactLevels[0].title).toBe('Minor');
      expect(result.current.state.impactLevels[1].title).toBe('Major');
    });

    it('hydrates impact categories', () => {
      mockQueryWithData({
        impact: {
          ratings: [],
          categories: [
            { name: 'Financial', color: '#10B981' },
            { name: 'Reputation', color: '#A855F7' },
          ],
        },
      });

      const { result } = renderHook(() => useRiskScoringSettingsStore());

      expect(result.current.state.impactCategories).toHaveLength(2);
      expect(result.current.state.impactCategories[0].name).toBe('Financial');
      expect(result.current.state.impactCategories[1].name).toBe('Reputation');
    });

    it('hydrates matrix entries', () => {
      mockQueryWithData({
        matrix: [
          {
            title: 'High Risk',
            value: 5,
            color: '#EF4444',
            likelihood: 2,
            impact: 2,
          },
        ],
      });

      const { result } = renderHook(() => useRiskScoringSettingsStore());

      expect(result.current.state.matrix).toHaveLength(1);
      expect(result.current.state.matrix[0].title).toBe('High Risk');
      expect(result.current.state.matrix[0].value).toBe(5);
      expect(result.current.state.matrix[0].likelihood).toBe(2);
      expect(result.current.state.matrix[0].impact).toBe(2);
    });
  });

  describe('cleanup on unmount', () => {
    it('resets store on unmount', () => {
      mockQueryWithData({
        likelihood: {
          ratings: [
            { value: 1, title: 'Low', description: '', color: '#9CA3AF' },
          ],
        },
      });

      const { result, unmount } = renderHook(() =>
        useRiskScoringSettingsStore()
      );

      expect(result.current.state.likelihoodLevels).toHaveLength(1);

      unmount();

      // Verify internal store reset
      expect(useInternalStore.getState().current).toBeNull();
    });

    it('resetToInitial clears all editing dialog state', () => {
      mockQueryWithData({});

      const { result } = renderHook(() => useRiskScoringSettingsStore());

      act(() => {
        result.current.setEditingLevel({
          type: 'likelihood',
          level: { value: 1, title: 'Low', description: '', color: '#fff' },
        });
        result.current.setEditingImpactCategory({
          name: 'Financial',
          color: '#fff',
        });
        result.current.setEditingMatrixCell({
          title: 'High Risk',
          value: 5,
          color: '#ff0000',
          likelihood: 2,
          impact: 2,
        });
      });

      act(() => {
        result.current.resetToInitial();
      });

      expect(result.current.editingLevel).toBeNull();
      expect(result.current.editingImpactCategory).toBeNull();
      expect(result.current.editingMatrixCell).toBeNull();
    });
  });

  describe('actions', () => {
    beforeEach(() => {
      mockQueryWithData({}); // Empty config
    });

    describe('addLikelihoodLevel', () => {
      it('adds level with incremented rating', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddLikelihoodLevel();
        });

        expect(result.current.state.likelihoodLevels).toHaveLength(1);
        expect(result.current.state.likelihoodLevels[0].value).toBe(1);

        act(() => {
          result.current.actions.onAddLikelihoodLevel();
        });

        expect(result.current.state.likelihoodLevels).toHaveLength(2);
        expect(result.current.state.likelihoodLevels[1].value).toBe(2);
      });

      it('sets default title and description', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddLikelihoodLevel();
        });

        expect(result.current.state.likelihoodLevels[0].title).toBe('Level 1');
        expect(result.current.state.likelihoodLevels[0].description).toBe('-');
      });

      it('uses fallback color #E5E7EB when no levels exist', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddLikelihoodLevel();
        });

        expect(result.current.state.likelihoodLevels[0].color).toBe('#E5E7EB');
      });

      it('copies color from last level when levels exist', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        // Manually set a level with custom color
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              likelihoodLevels: [
                {
                  value: 1,
                  title: 'Low',
                  description: '',
                  color: '#FF0000',
                },
              ],
            },
          });
        });

        act(() => {
          result.current.actions.onAddLikelihoodLevel();
        });

        expect(result.current.state.likelihoodLevels[1].color).toBe('#FF0000');
      });
    });

    describe('addImpactLevel', () => {
      it('adds level with incremented rating', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddImpactLevel();
        });

        expect(result.current.state.impactLevels).toHaveLength(1);
        expect(result.current.state.impactLevels[0].value).toBe(1);

        act(() => {
          result.current.actions.onAddImpactLevel();
        });

        expect(result.current.state.impactLevels).toHaveLength(2);
        expect(result.current.state.impactLevels[1].value).toBe(2);
      });

      it('sets default title and description', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddImpactLevel();
        });

        expect(result.current.state.impactLevels[0].title).toBe('Level 1');
        expect(result.current.state.impactLevels[0].description).toBe('-');
      });

      it('uses fallback color #E5E7EB when no levels exist', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddImpactLevel();
        });

        expect(result.current.state.impactLevels[0].color).toBe('#E5E7EB');
      });
    });

    describe('addImpactCategory', () => {
      it('adds category with default name and color', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddImpactCategory();
        });

        expect(result.current.state.impactCategories).toHaveLength(1);
        expect(result.current.state.impactCategories[0].name).toBe(
          'New Category 1'
        );
        expect(result.current.state.impactCategories[0].color).toBe('#474771');
      });

      it('increments category name number', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddImpactCategory();
          result.current.actions.onAddImpactCategory();
        });

        expect(result.current.state.impactCategories[0].name).toBe(
          'New Category 1'
        );
        expect(result.current.state.impactCategories[1].name).toBe(
          'New Category 2'
        );
      });
    });

    describe('deleteLikelihoodLevel', () => {
      it('removes level from array', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              likelihoodLevels: [
                {
                  value: 1,
                  title: 'Low',
                  description: '',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'High',
                  description: '',
                  color: '#000',
                },
              ],
            },
          });
        });

        act(() => {
          result.current.actions.onDeleteLikelihoodLevel(1);
        });

        expect(result.current.state.likelihoodLevels).toHaveLength(1);
        expect(result.current.state.likelihoodLevels[0].value).toBe(2);
      });

      it('removes corresponding matrix entries (cascading delete)', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              likelihoodLevels: [
                {
                  value: 1,
                  title: 'Low',
                  description: '',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'High',
                  description: '',
                  color: '#000',
                },
              ],
              matrix: [
                {
                  title: 'Low Risk',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 1,
                  impact: 1,
                },
                {
                  title: 'High Risk',
                  value: 5,
                  color: '#ff0000',
                  likelihood: 2,
                  impact: 1,
                },
              ],
            },
          });
        });

        act(() => {
          result.current.actions.onDeleteLikelihoodLevel(1);
        });

        // Matrix should only have entry with likelihood: 2
        expect(result.current.state.matrix).toHaveLength(1);
        expect(result.current.state.matrix[0].title).toBe('High Risk');
      });

      it('removes matrix entries matching the deleted likelihood level', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              matrix: [
                {
                  title: 'Low',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 1,
                  impact: 1,
                },
                {
                  title: 'Medium',
                  value: 3,
                  color: '#ffff00',
                  likelihood: 1,
                  impact: 2,
                },
                {
                  title: 'High',
                  value: 5,
                  color: '#ff0000',
                  likelihood: 2,
                  impact: 1,
                },
              ],
            },
          });
        });

        act(() => {
          result.current.actions.onDeleteLikelihoodLevel(1);
        });

        // Only the entry with likelihood: 2 should remain
        expect(result.current.state.matrix).toHaveLength(1);
        expect(result.current.state.matrix[0].title).toBe('High');
      });
    });

    describe('deleteImpactLevel', () => {
      it('removes level from array', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              impactLevels: [
                {
                  value: 1,
                  title: 'Minor',
                  description: '',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'Major',
                  description: '',
                  color: '#000',
                },
              ],
            },
          });
        });

        act(() => {
          result.current.actions.onDeleteImpactLevel(1);
        });

        expect(result.current.state.impactLevels).toHaveLength(1);
        expect(result.current.state.impactLevels[0].value).toBe(2);
      });

      it('removes corresponding matrix entries (cascading delete)', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              impactLevels: [
                {
                  value: 1,
                  title: 'Minor',
                  description: '',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'Major',
                  description: '',
                  color: '#000',
                },
              ],
              matrix: [
                {
                  title: 'Low Risk',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 1,
                  impact: 1,
                },
                {
                  title: 'High Risk',
                  value: 5,
                  color: '#ff0000',
                  likelihood: 1,
                  impact: 2,
                },
              ],
            },
          });
        });

        act(() => {
          result.current.actions.onDeleteImpactLevel(1);
        });

        // Matrix should only have entry with impact: 2
        expect(result.current.state.matrix).toHaveLength(1);
        expect(result.current.state.matrix[0].title).toBe('High Risk');
      });
    });

    describe('deleteImpactCategory', () => {
      it('removes category by name', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              impactCategories: [
                { name: 'Financial', color: '#fff' },
                { name: 'Reputation', color: '#000' },
              ],
            },
          });
        });

        act(() => {
          result.current.actions.onDeleteImpactCategory('Financial');
        });

        expect(result.current.state.impactCategories).toHaveLength(1);
        expect(result.current.state.impactCategories[0].name).toBe(
          'Reputation'
        );
      });
    });

    describe('setMatrixInverted', () => {
      it('updates isMatrixInverted flag', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        expect(result.current.state.isMatrixInverted).toBe(false);

        act(() => {
          result.current.actions.onInvertMatrixChange(true);
        });

        expect(result.current.state.isMatrixInverted).toBe(true);
      });
    });

    describe('setMultiImpactEnabled', () => {
      it('updates isMultiImpactEnabled flag', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        expect(result.current.state.isMultiImpactEnabled).toBe(false);

        act(() => {
          result.current.actions.onMultiImpactEnabledChange(true);
        });

        expect(result.current.state.isMultiImpactEnabled).toBe(true);
      });
    });

    describe('setSelectedMethodology', () => {
      it('updates selectedMethodology', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        expect(result.current.state.selectedMethodology).toBe(
          'impact-likelihood'
        );

        act(() => {
          result.current.actions.onSelectedMethodologyChange('multi-impact');
        });

        expect(result.current.state.selectedMethodology).toBe('multi-impact');
      });
    });

    describe('setImpactAggregation', () => {
      it('updates impactAggregation state', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        expect(result.current.state.impactAggregation).toBe('average');

        act(() => {
          result.current.actions.onImpactAggregationChange('maximum');
        });

        expect(result.current.state.impactAggregation).toBe('maximum');
      });
    });

    describe('edit actions', () => {
      it('onEditLikelihoodLevel sets editingLevel with likelihood type', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const level = {
          value: 1,
          title: 'Low',
          description: '',
          color: '#fff',
        };

        act(() => {
          result.current.actions.onEditLikelihoodLevel(level);
        });

        expect(result.current.editingLevel).toEqual({
          type: 'likelihood',
          level,
        });
      });

      it('onEditImpactLevel sets editingLevel with impact type', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const level = {
          value: 1,
          title: 'Minor',
          description: '',
          color: '#fff',
        };

        act(() => {
          result.current.actions.onEditImpactLevel(level);
        });

        expect(result.current.editingLevel).toEqual({ type: 'impact', level });
      });

      it('onEditImpactCategory sets editingImpactCategory', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const category = { name: 'Financial', color: '#fff' };

        act(() => {
          result.current.actions.onEditImpactCategory(category);
        });

        expect(result.current.editingImpactCategory).toEqual(category);
      });

      it('onEditMatrixCell sets editingMatrixCell', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const cell = {
          title: 'High Risk',
          value: 5,
          color: '#ff0000',
          likelihood: 2,
          impact: 2,
        };

        act(() => {
          result.current.actions.onEditMatrixCell(cell);
        });

        expect(result.current.editingMatrixCell).toEqual(cell);
      });
    });
  });

  describe('editing dialog state', () => {
    beforeEach(() => {
      mockQueryWithData({});
    });

    describe('setEditingLevel', () => {
      it('opens likelihood dialog', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const level = {
          value: 1,
          title: 'Low',
          description: '',
          color: '#fff',
        };

        act(() => {
          result.current.setEditingLevel({ type: 'likelihood', level });
        });

        expect(result.current.editingLevel).toEqual({
          type: 'likelihood',
          level,
        });
      });

      it('opens impact dialog', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const level = {
          value: 1,
          title: 'Minor',
          description: '',
          color: '#fff',
        };

        act(() => {
          result.current.setEditingLevel({ type: 'impact', level });
        });

        expect(result.current.editingLevel).toEqual({ type: 'impact', level });
      });

      it('clears dialog when set to null', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const level = {
          value: 1,
          title: 'Low',
          description: '',
          color: '#fff',
        };

        act(() => {
          result.current.setEditingLevel({ type: 'likelihood', level });
        });
        act(() => {
          result.current.setEditingLevel(null);
        });

        expect(result.current.editingLevel).toBeNull();
      });
    });

    describe('confirmEditLevel', () => {
      it('updates likelihood level and clears dialog', () => {
        mockQueryWithData({
          likelihood: {
            ratings: [
              { value: 1, title: 'Low', description: '', color: '#fff' },
            ],
          },
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const originalLevel = {
          value: 1,
          title: 'Low',
          description: '',
          color: '#fff',
        };
        const updatedLevel = {
          value: 1,
          title: 'Updated Low',
          description: 'Updated',
          color: '#000',
        };

        act(() => {
          result.current.setEditingLevel({
            type: 'likelihood',
            level: originalLevel,
          });
        });
        act(() => {
          result.current.confirmEditLevel(updatedLevel);
        });

        expect(result.current.state.likelihoodLevels[0]).toEqual(updatedLevel);
        expect(result.current.editingLevel).toBeNull();
      });

      it('updates impact level and clears dialog', () => {
        mockQueryWithData({
          impact: {
            ratings: [
              { value: 1, title: 'Minor', description: '', color: '#fff' },
            ],
          },
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const originalLevel = {
          value: 1,
          title: 'Minor',
          description: '',
          color: '#fff',
        };
        const updatedLevel = {
          value: 1,
          title: 'Updated Minor',
          description: 'Updated',
          color: '#000',
        };

        act(() => {
          result.current.setEditingLevel({
            type: 'impact',
            level: originalLevel,
          });
        });
        act(() => {
          result.current.confirmEditLevel(updatedLevel);
        });

        expect(result.current.state.impactLevels[0]).toEqual(updatedLevel);
        expect(result.current.editingLevel).toBeNull();
      });

      it('is a no-op when editingLevel is null', () => {
        mockQueryWithData({
          likelihood: {
            ratings: [
              { value: 1, title: 'Low', description: '', color: '#fff' },
            ],
          },
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const updatedLevel = {
          value: 1,
          title: 'Updated',
          description: '',
          color: '#000',
        };

        act(() => {
          result.current.confirmEditLevel(updatedLevel);
        });

        expect(result.current.state.likelihoodLevels[0].title).toBe('Low');
        expect(result.current.editingLevel).toBeNull();
      });
    });

    describe('setEditingImpactCategory', () => {
      it('opens category dialog', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const category = { name: 'Financial', color: '#fff' };

        act(() => {
          result.current.setEditingImpactCategory(category);
        });

        expect(result.current.editingImpactCategory).toEqual(category);
      });

      it('clears dialog when set to null', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const category = { name: 'Financial', color: '#fff' };

        act(() => {
          result.current.setEditingImpactCategory(category);
        });
        act(() => {
          result.current.setEditingImpactCategory(null);
        });

        expect(result.current.editingImpactCategory).toBeNull();
      });
    });

    describe('confirmEditImpactCategory', () => {
      it('updates category by original name and clears dialog', () => {
        mockQueryWithData({
          impact: {
            ratings: [],
            categories: [
              { name: 'Financial', color: '#fff' },
              { name: 'Reputation', color: '#000' },
            ],
          },
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const originalCategory = { name: 'Financial', color: '#fff' };
        const updatedCategory = { name: 'Financial Updated', color: '#123456' };

        act(() => {
          result.current.setEditingImpactCategory(originalCategory);
        });
        act(() => {
          result.current.confirmEditImpactCategory(updatedCategory);
        });

        expect(result.current.state.impactCategories[0]).toEqual(
          updatedCategory
        );
        expect(result.current.state.impactCategories[1].name).toBe(
          'Reputation'
        );
        expect(result.current.editingImpactCategory).toBeNull();
      });

      it('is a no-op when editingImpactCategory is null', () => {
        mockQueryWithData({
          impact: {
            ratings: [],
            categories: [{ name: 'Financial', color: '#fff' }],
          },
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const updatedCategory = { name: 'Updated', color: '#000' };

        act(() => {
          result.current.confirmEditImpactCategory(updatedCategory);
        });

        expect(result.current.state.impactCategories[0].name).toBe('Financial');
      });
    });

    describe('setEditingMatrixCell', () => {
      it('opens matrix cell dialog', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const cell = {
          title: 'High Risk',
          value: 5,
          color: '#ff0000',
          likelihood: 2,
          impact: 2,
        };

        act(() => {
          result.current.setEditingMatrixCell(cell);
        });

        expect(result.current.editingMatrixCell).toEqual(cell);
      });

      it('clears dialog when set to null', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const cell = {
          title: 'High Risk',
          value: 5,
          color: '#ff0000',
          likelihood: 2,
          impact: 2,
        };

        act(() => {
          result.current.setEditingMatrixCell(cell);
        });
        act(() => {
          result.current.setEditingMatrixCell(null);
        });

        expect(result.current.editingMatrixCell).toBeNull();
      });
    });

    describe('confirmEditMatrixCell', () => {
      it('updates matrix cell and clears dialog', () => {
        mockQueryWithData({
          matrix: [
            {
              title: 'Low Risk',
              value: 1,
              color: '#00ff00',
              likelihood: 1,
              impact: 1,
            },
          ],
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const cell = {
          title: 'High Risk',
          value: 5,
          color: '#ff0000',
          likelihood: 1,
          impact: 1,
        };

        act(() => {
          result.current.setEditingMatrixCell(cell);
        });
        act(() => {
          result.current.confirmEditMatrixCell(cell);
        });

        expect(result.current.state.matrix[0].title).toBe('High Risk');
        expect(result.current.state.matrix[0].value).toBe(5);
        expect(result.current.state.matrix[0].color).toBe('#ff0000');
        expect(result.current.editingMatrixCell).toBeNull();
      });

      it('editing a cell does not affect other cells with the same value', () => {
        mockQueryWithData({
          matrix: [
            {
              title: 'Medium Risk',
              value: 3,
              color: '#ffff00',
              likelihood: 1,
              impact: 1,
            },
            {
              title: 'Medium Risk',
              value: 3,
              color: '#ffff00',
              likelihood: 2,
              impact: 2,
            },
          ],
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const cell = {
          title: 'High Risk',
          value: 5,
          color: '#ff0000',
          likelihood: 1,
          impact: 1,
        };

        act(() => {
          result.current.setEditingMatrixCell(cell);
        });
        act(() => {
          result.current.confirmEditMatrixCell(cell);
        });

        const matrix = result.current.state.matrix;
        // The edited cell should be updated
        const edited = matrix.find((e) => e.likelihood === 1 && e.impact === 1);
        expect(edited!.title).toBe('High Risk');
        expect(edited!.value).toBe(5);
        expect(edited!.color).toBe('#ff0000');

        // The other cell should be unchanged
        const other = matrix.find((e) => e.likelihood === 2 && e.impact === 2);
        expect(other!.title).toBe('Medium Risk');
        expect(other!.value).toBe(3);
        expect(other!.color).toBe('#ffff00');
      });

      it('creating a new cell adds a standalone entry', () => {
        mockQueryWithData({
          matrix: [
            {
              title: 'Low Risk',
              value: 1,
              color: '#00ff00',
              likelihood: 1,
              impact: 1,
            },
          ],
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        // Add a cell for a pair that doesn't exist yet
        const cell = {
          title: 'High Risk',
          value: 5,
          color: '#ff0000',
          likelihood: 2,
          impact: 2,
        };

        act(() => {
          result.current.setEditingMatrixCell(cell);
        });
        act(() => {
          result.current.confirmEditMatrixCell(cell);
        });

        const matrix = result.current.state.matrix;
        expect(matrix).toHaveLength(2);
        // Original cell untouched
        expect(matrix[0].title).toBe('Low Risk');
        // New cell added
        const newEntry = matrix.find((e) => e.title === 'High Risk');
        expect(newEntry).toBeDefined();
        expect(newEntry!.value).toBe(5);
        expect(newEntry!.color).toBe('#ff0000');
        expect(newEntry!.likelihood).toBe(2);
        expect(newEntry!.impact).toBe(2);
      });

      it('removes old group and creates new one when editing the only pair', () => {
        mockQueryWithData({
          matrix: [
            {
              title: 'Low Risk',
              value: 1,
              color: '#00ff00',
              likelihood: 1,
              impact: 1,
            },
          ],
        });
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        const cell = {
          title: 'Critical',
          value: 10,
          color: '#ff0000',
          likelihood: 1,
          impact: 1,
        };

        act(() => {
          result.current.setEditingMatrixCell(cell);
        });
        act(() => {
          result.current.confirmEditMatrixCell(cell);
        });

        const matrix = result.current.state.matrix;
        expect(matrix).toHaveLength(1);
        expect(matrix.find((e) => e.title === 'Low Risk')).toBeUndefined();
        const critical = matrix.find((e) => e.title === 'Critical');
        expect(critical).toBeDefined();
        expect(critical!.value).toBe(10);
        expect(critical!.color).toBe('#ff0000');
        expect(critical!.likelihood).toBe(1);
        expect(critical!.impact).toBe(1);
      });
    });
  });

  describe('computed state', () => {
    beforeEach(() => {
      mockQueryWithData({}); // Empty config
    });

    describe('completion flags', () => {
      it('isLikelihoodLevelsComplete reflects validation', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        // Initially incomplete (no levels)
        expect(result.current.state.isLikelihoodLevelsComplete).toBe(false);

        // Add 2 valid levels
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              likelihoodLevels: [
                {
                  value: 1,
                  title: 'Low',
                  description: 'Low risk',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'High',
                  description: 'High risk',
                  color: '#000',
                },
              ],
            },
          });
        });

        expect(result.current.state.isLikelihoodLevelsComplete).toBe(true);
      });

      it('isImpactLevelsComplete reflects validation', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        // Initially incomplete
        expect(result.current.state.isImpactLevelsComplete).toBe(false);

        // Add 2 valid levels
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              impactLevels: [
                {
                  value: 1,
                  title: 'Minor',
                  description: 'Minor impact',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'Major',
                  description: 'Major impact',
                  color: '#000',
                },
              ],
            },
          });
        });

        expect(result.current.state.isImpactLevelsComplete).toBe(true);
      });

      it('isImpactCategoriesComplete reflects validation', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        // Initially incomplete
        expect(result.current.state.isImpactCategoriesComplete).toBe(false);

        // Add 2 valid categories
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              impactCategories: [
                { name: 'Financial', color: '#fff' },
                { name: 'Reputation', color: '#000' },
              ],
            },
          });
        });

        expect(result.current.state.isImpactCategoriesComplete).toBe(true);
      });

      it('isMatrixComplete updates when level counts change', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        // Set up 2x2 complete matrix
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              likelihoodLevels: [
                {
                  value: 1,
                  title: 'Low',
                  description: '',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'High',
                  description: '',
                  color: '#000',
                },
              ],
              impactLevels: [
                {
                  value: 1,
                  title: 'Minor',
                  description: '',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'Major',
                  description: '',
                  color: '#000',
                },
              ],
              matrix: [
                {
                  title: 'Low',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 1,
                  impact: 1,
                },
                {
                  title: 'Low',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 1,
                  impact: 2,
                },
                {
                  title: 'Low',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 2,
                  impact: 1,
                },
                {
                  title: 'Low',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 2,
                  impact: 2,
                },
              ],
            },
          });
        });

        expect(result.current.state.isMatrixComplete).toBe(true);

        // Add a new level - now need 3x2 = 6 cells but only have 4
        act(() => {
          result.current.actions.onAddLikelihoodLevel();
        });

        expect(result.current.state.isMatrixComplete).toBe(false);
      });

      it('isImpactLikelihoodComplete requires all three complete', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        // Set up complete likelihood + impact
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              likelihoodLevels: [
                {
                  value: 1,
                  title: 'Low',
                  description: 'Low',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'High',
                  description: 'High',
                  color: '#000',
                },
              ],
              impactLevels: [
                {
                  value: 1,
                  title: 'Minor',
                  description: 'Minor',
                  color: '#fff',
                },
                {
                  value: 2,
                  title: 'Major',
                  description: 'Major',
                  color: '#000',
                },
              ],
            },
          });
        });

        // Matrix incomplete
        expect(result.current.state.isImpactLikelihoodComplete).toBe(false);

        // Add complete matrix
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              matrix: [
                {
                  title: 'Risk',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 1,
                  impact: 1,
                },
                {
                  title: 'Risk',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 1,
                  impact: 2,
                },
                {
                  title: 'Risk',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 2,
                  impact: 1,
                },
                {
                  title: 'Risk',
                  value: 1,
                  color: '#00ff00',
                  likelihood: 2,
                  impact: 2,
                },
              ],
            },
          });
        });

        // Now all complete
        expect(result.current.state.isImpactLikelihoodComplete).toBe(true);
      });

      it('isMultiImpactComplete requires categories complete', () => {
        const { result } = renderHook(() => useRiskScoringSettingsStore());

        // Initially incomplete
        expect(result.current.state.isMultiImpactComplete).toBe(false);

        // Add complete categories
        act(() => {
          const state = useInternalStore.getState();
          useInternalStore.setState({
            current: {
              ...state.current!,
              impactCategories: [
                { name: 'Financial', color: '#fff' },
                { name: 'Reputation', color: '#000' },
              ],
            },
          });
        });

        // Now complete
        expect(result.current.state.isMultiImpactComplete).toBe(true);
      });
    });

    describe('changeStatus', () => {
      it('returns none before hydration (no initialData)', () => {
        mockQueryLoading();
        const { result } = renderHook(() => useRiskScoringSettingsStore());
        expect(result.current.state.changeStatus).toBe('none');
      });

      it('returns none immediately after hydration', () => {
        mockQueryWithData({
          likelihood: {
            ratings: [
              { value: 1, title: 'Low', description: '', color: '#9CA3AF' },
            ],
          },
        });

        const { result } = renderHook(() => useRiskScoringSettingsStore());
        expect(result.current.state.changeStatus).toBe('none');
      });

      it('returns structural after adding level', () => {
        mockQueryWithData({});

        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onAddLikelihoodLevel();
        });

        expect(result.current.state.changeStatus).toBe('structural');
      });

      it('returns structural after deleting level', () => {
        mockQueryWithData({
          likelihood: {
            ratings: [
              { value: 1, title: 'Low', description: '', color: '#9CA3AF' },
              { value: 2, title: 'High', description: '', color: '#EF4444' },
            ],
          },
        });

        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onDeleteLikelihoodLevel(1);
        });

        expect(result.current.state.changeStatus).toBe('structural');
      });

      it('returns structural after deleting category', () => {
        mockQueryWithData({
          impact: {
            ratings: [],
            categories: [{ name: 'Financial', color: '#10B981' }],
          },
        });

        const { result } = renderHook(() => useRiskScoringSettingsStore());

        act(() => {
          result.current.actions.onDeleteImpactCategory('Financial');
        });

        expect(result.current.state.changeStatus).toBe('structural');
      });
    });
  });
});
