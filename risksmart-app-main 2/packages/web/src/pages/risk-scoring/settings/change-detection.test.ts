import type { ImpactCategory, MatrixCell, RiskScoringLevel } from 'src/blocks';
import { describe, expect, it } from 'vitest';

import { analyzeChanges } from './change-detection';
import type { ScoringSettingsData } from './useRiskScoringSettingsStore';

// Test helpers
const createMockLevel = (
  overrides?: Partial<RiskScoringLevel>
): RiskScoringLevel => ({
  value: 1,
  title: 'Level 1',
  description: 'Description',
  color: '#E5E7EB',
  ...overrides,
});

const createMockCategory = (
  overrides?: Partial<ImpactCategory>
): ImpactCategory => ({
  name: 'Category 1',
  color: '#474771',
  ...overrides,
});

const createMockMatrixEntries = (
  likelihoodCount: number,
  impactCount: number
): MatrixCell[] =>
  Array.from({ length: likelihoodCount * impactCount }, (_, i) => ({
    title: 'High',
    value: 5,
    color: '#ff0000',
    likelihood: Math.floor(i / impactCount) + 1,
    impact: (i % impactCount) + 1,
  }));

describe('change-detection', () => {
  describe('analyzeChanges', () => {
    const baseData: ScoringSettingsData = {
      likelihoodLevels: [createMockLevel({ value: 1, title: 'Low' })],
      impactLevels: [createMockLevel({ value: 1, title: 'Minor' })],
      impactCategories: [createMockCategory({ name: 'Financial' })],
      matrix: createMockMatrixEntries(1, 1),
      impactAggregation: 'average',
      id: 'test-id',
      originalTimestamp: '2024-01-01T00:00:00Z',
    };

    it('returns none when data is identical', () => {
      expect(analyzeChanges(baseData, baseData)).toBe('none');
    });

    describe('cosmetic changes (likelihoodLevels)', () => {
      it('detects different title as cosmetic', () => {
        const current = {
          ...baseData,
          likelihoodLevels: [
            { ...baseData.likelihoodLevels[0], title: 'Changed' },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects different description as cosmetic', () => {
        const current = {
          ...baseData,
          likelihoodLevels: [
            { ...baseData.likelihoodLevels[0], description: 'Changed' },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects different color as cosmetic', () => {
        const current = {
          ...baseData,
          likelihoodLevels: [
            { ...baseData.likelihoodLevels[0], color: '#000000' },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects position change as cosmetic (array order matters)', () => {
        const level1 = createMockLevel({ value: 1, title: 'Low' });
        const level2 = createMockLevel({ value: 2, title: 'High' });
        const initial = { ...baseData, likelihoodLevels: [level1, level2] };
        const current = { ...baseData, likelihoodLevels: [level2, level1] }; // Swapped
        expect(analyzeChanges(initial, current)).toBe('cosmetic');
      });

      it('returns none when levels are empty in both', () => {
        const initial = { ...baseData, likelihoodLevels: [] };
        const current = { ...baseData, likelihoodLevels: [] };
        expect(analyzeChanges(initial, current)).toBe('none');
      });
    });

    describe('structural changes (likelihoodLevels)', () => {
      it('detects different array length as structural', () => {
        const current = {
          ...baseData,
          likelihoodLevels: [
            ...baseData.likelihoodLevels,
            createMockLevel({ value: 2 }),
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('detects different rating value as structural', () => {
        const current = {
          ...baseData,
          likelihoodLevels: [{ ...baseData.likelihoodLevels[0], value: 999 }],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });
    });

    describe('cosmetic changes (impactLevels)', () => {
      it('detects different title as cosmetic', () => {
        const current = {
          ...baseData,
          impactLevels: [{ ...baseData.impactLevels[0], title: 'Changed' }],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects different description as cosmetic', () => {
        const current = {
          ...baseData,
          impactLevels: [
            { ...baseData.impactLevels[0], description: 'Changed' },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects different color as cosmetic', () => {
        const current = {
          ...baseData,
          impactLevels: [{ ...baseData.impactLevels[0], color: '#000000' }],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects position change as cosmetic (array order matters)', () => {
        const level1 = createMockLevel({ value: 1, title: 'Minor' });
        const level2 = createMockLevel({ value: 2, title: 'Major' });
        const initial = { ...baseData, impactLevels: [level1, level2] };
        const current = { ...baseData, impactLevels: [level2, level1] }; // Swapped
        expect(analyzeChanges(initial, current)).toBe('cosmetic');
      });
    });

    describe('structural changes (impactLevels)', () => {
      it('detects different array length as structural', () => {
        const current = {
          ...baseData,
          impactLevels: [
            ...baseData.impactLevels,
            createMockLevel({ value: 2 }),
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('detects different rating value as structural', () => {
        const current = {
          ...baseData,
          impactLevels: [{ ...baseData.impactLevels[0], value: 999 }],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });
    });

    describe('cosmetic changes (impactCategories)', () => {
      it('detects different name as cosmetic', () => {
        const current = {
          ...baseData,
          impactCategories: [
            { ...baseData.impactCategories[0], name: 'Changed' },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects different color as cosmetic', () => {
        const current = {
          ...baseData,
          impactCategories: [
            { ...baseData.impactCategories[0], color: '#000000' },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects position change as cosmetic', () => {
        const cat1 = createMockCategory({ name: 'Financial' });
        const cat2 = createMockCategory({ name: 'Reputation' });
        const initial = { ...baseData, impactCategories: [cat1, cat2] };
        const current = { ...baseData, impactCategories: [cat2, cat1] }; // Swapped
        expect(analyzeChanges(initial, current)).toBe('cosmetic');
      });

      it('returns none when categories are empty in both', () => {
        const initial = { ...baseData, impactCategories: [] };
        const current = { ...baseData, impactCategories: [] };
        expect(analyzeChanges(initial, current)).toBe('none');
      });
    });

    describe('structural changes (impactCategories)', () => {
      it('detects different array length as structural', () => {
        const current = {
          ...baseData,
          impactCategories: [
            ...baseData.impactCategories,
            createMockCategory({ name: 'Reputation' }),
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('detects clearing all categories as structural (multi-impact disabled)', () => {
        const initial = {
          ...baseData,
          impactCategories: [
            createMockCategory({ name: 'Financial' }),
            createMockCategory({ name: 'Reputational' }),
          ],
        };
        const current = {
          ...initial,
          impactCategories: [],
        };
        expect(analyzeChanges(initial, current)).toBe('structural');
      });
    });

    describe('cosmetic changes (matrix)', () => {
      it('detects different title as cosmetic', () => {
        const current = {
          ...baseData,
          matrix: [{ ...baseData.matrix[0], title: 'Changed' }],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects different color as cosmetic', () => {
        const current = {
          ...baseData,
          matrix: [{ ...baseData.matrix[0], color: '#000000' }],
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('returns none when matrix is empty in both', () => {
        const initial = { ...baseData, matrix: [] };
        const current = { ...baseData, matrix: [] };
        expect(analyzeChanges(initial, current)).toBe('none');
      });
    });

    describe('structural changes (matrix)', () => {
      it('detects added cell as structural', () => {
        const current = {
          ...baseData,
          matrix: [
            ...baseData.matrix,
            {
              title: 'Low',
              value: 2,
              color: '#00ff00',
              likelihood: 2,
              impact: 1,
            },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('detects different value as structural', () => {
        const current = {
          ...baseData,
          matrix: [{ ...baseData.matrix[0], value: 999 }],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('detects different matrix array length as structural', () => {
        const current = {
          ...baseData,
          matrix: [
            ...baseData.matrix,
            { ...baseData.matrix[0], likelihood: 2, impact: 2 },
          ],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('detects different likelihood value in entry as structural', () => {
        const current = {
          ...baseData,
          matrix: [{ ...baseData.matrix[0], likelihood: 999 }],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('detects different impact value in entry as structural', () => {
        const current = {
          ...baseData,
          matrix: [{ ...baseData.matrix[0], impact: 999 }],
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });
    });

    describe('structural changes (impactAggregation)', () => {
      it('detects aggregation method change as structural', () => {
        const current = {
          ...baseData,
          impactAggregation: 'maximum' as const,
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('returns none when aggregation method is the same', () => {
        const current = {
          ...baseData,
          impactAggregation: 'average' as const,
        };
        expect(analyzeChanges(baseData, current)).toBe('none');
      });
    });

    describe('combined changes', () => {
      it('detects multiple cosmetic sections changed simultaneously', () => {
        const current = {
          likelihoodLevels: [
            { ...baseData.likelihoodLevels[0], title: 'Changed' },
          ],
          impactLevels: [{ ...baseData.impactLevels[0], title: 'Changed' }],
          impactCategories: baseData.impactCategories,
          impactAggregation: 'average' as const,
          matrix: baseData.matrix,
          id: baseData.id,
          originalTimestamp: baseData.originalTimestamp,
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('detects when all sections changed cosmetically', () => {
        const current = {
          likelihoodLevels: [
            { ...baseData.likelihoodLevels[0], title: 'Changed' },
          ],
          impactLevels: [{ ...baseData.impactLevels[0], title: 'Changed' }],
          impactCategories: [
            { ...baseData.impactCategories[0], name: 'Changed' },
          ],
          impactAggregation: 'average' as const,
          matrix: [{ ...baseData.matrix[0], title: 'Changed' }],
          id: baseData.id,
          originalTimestamp: baseData.originalTimestamp,
        };
        expect(analyzeChanges(baseData, current)).toBe('cosmetic');
      });

      it('returns structural when mix of cosmetic and structural', () => {
        const current = {
          ...baseData,
          likelihoodLevels: [
            { ...baseData.likelihoodLevels[0], title: 'Changed' },
          ],
          impactAggregation: 'maximum' as const,
        };
        expect(analyzeChanges(baseData, current)).toBe('structural');
      });

      it('returns none when no sections have changes', () => {
        const current = { ...baseData };
        expect(analyzeChanges(baseData, current)).toBe('none');
      });
    });
  });
});
