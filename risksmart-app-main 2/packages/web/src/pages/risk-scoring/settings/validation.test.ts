import type { ImpactCategory, MatrixCell, RiskScoringLevel } from 'src/blocks';
import { describe, expect, it } from 'vitest';

import {
  areImpactCategoriesComplete,
  areImpactLevelsComplete,
  areLikelihoodLevelsComplete,
  isMatrixComplete,
} from './validation';

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

describe('validation', () => {
  describe('areLikelihoodLevelsComplete', () => {
    it('returns false for empty array', () => {
      expect(areLikelihoodLevelsComplete([])).toBe(false);
    });

    it('returns false for single level (need > 1)', () => {
      const level = createMockLevel();
      expect(areLikelihoodLevelsComplete([level])).toBe(false);
    });

    it.each([
      { field: 'value', value: null, reason: 'null rating' },
      { field: 'value', value: undefined, reason: 'undefined rating' },
      { field: 'title', value: '', reason: 'empty title' },
      { field: 'title', value: null, reason: 'null title' },
      { field: 'title', value: '   ', reason: 'whitespace-only title' },
      {
        field: 'description',
        value: '',
        reason: 'empty description',
      },
      {
        field: 'description',
        value: null,
        reason: 'null description',
      },
      {
        field: 'description',
        value: '   ',
        reason: 'whitespace-only description',
      },
      { field: 'color', value: '', reason: 'empty color' },
      { field: 'color', value: null, reason: 'null color' },
      {
        field: 'color',
        value: '   ',
        reason: 'whitespace-only color',
      },
    ])('returns false when $reason', ({ field, value }) => {
      const levels = [
        createMockLevel(),
        createMockLevel({ [field]: value } as Partial<RiskScoringLevel>),
      ];
      expect(areLikelihoodLevelsComplete(levels)).toBe(false);
    });

    it('returns true for exactly 2 valid levels', () => {
      const levels = [
        createMockLevel({ value: 1, title: 'Low' }),
        createMockLevel({ value: 2, title: 'High' }),
      ];
      expect(areLikelihoodLevelsComplete(levels)).toBe(true);
    });

    it('returns true for 3+ valid levels', () => {
      const levels = [
        createMockLevel({ value: 1 }),
        createMockLevel({ value: 2 }),
        createMockLevel({ value: 3 }),
      ];
      expect(areLikelihoodLevelsComplete(levels)).toBe(true);
    });
  });

  describe('areImpactLevelsComplete', () => {
    it('returns false for empty array', () => {
      expect(areImpactLevelsComplete([])).toBe(false);
    });

    it('returns false for single level (need > 1)', () => {
      const level = createMockLevel();
      expect(areImpactLevelsComplete([level])).toBe(false);
    });

    it.each([
      { field: 'value', value: null, reason: 'null rating' },
      { field: 'title', value: '', reason: 'empty title' },
      { field: 'title', value: '   ', reason: 'whitespace-only title' },
      {
        field: 'description',
        value: '',
        reason: 'empty description',
      },
      {
        field: 'description',
        value: '   ',
        reason: 'whitespace-only description',
      },
      { field: 'color', value: '', reason: 'empty color' },
      {
        field: 'color',
        value: '   ',
        reason: 'whitespace-only color',
      },
    ])('returns false when $reason', ({ field, value }) => {
      const levels = [
        createMockLevel(),
        createMockLevel({ [field]: value } as Partial<RiskScoringLevel>),
      ];
      expect(areImpactLevelsComplete(levels)).toBe(false);
    });

    it('returns true for exactly 2 valid levels', () => {
      const levels = [
        createMockLevel({ value: 1, title: 'Minor' }),
        createMockLevel({ value: 2, title: 'Major' }),
      ];
      expect(areImpactLevelsComplete(levels)).toBe(true);
    });

    it('returns true for 3+ valid levels', () => {
      const levels = [
        createMockLevel({ value: 1 }),
        createMockLevel({ value: 2 }),
        createMockLevel({ value: 3 }),
      ];
      expect(areImpactLevelsComplete(levels)).toBe(true);
    });
  });

  describe('areImpactCategoriesComplete', () => {
    it('returns false for empty array', () => {
      expect(areImpactCategoriesComplete([])).toBe(false);
    });

    it('returns false for single category (need > 1)', () => {
      const category = createMockCategory();
      expect(areImpactCategoriesComplete([category])).toBe(false);
    });

    it.each([
      { field: 'name', value: '', reason: 'empty name' },
      { field: 'name', value: null, reason: 'null name' },
      { field: 'name', value: '   ', reason: 'whitespace-only name' },
      { field: 'color', value: '', reason: 'empty color' },
      { field: 'color', value: null, reason: 'null color' },
      {
        field: 'color',
        value: '   ',
        reason: 'whitespace-only color',
      },
    ])('returns false when $reason', ({ field, value }) => {
      const categories = [
        createMockCategory(),
        createMockCategory({ [field]: value } as Partial<ImpactCategory>),
      ];
      expect(areImpactCategoriesComplete(categories)).toBe(false);
    });

    it('returns true for exactly 2 valid categories', () => {
      const categories = [
        createMockCategory({ name: 'Financial' }),
        createMockCategory({ name: 'Reputation' }),
      ];
      expect(areImpactCategoriesComplete(categories)).toBe(true);
    });

    it('returns true for 3+ valid categories', () => {
      const categories = [
        createMockCategory({ name: 'Financial' }),
        createMockCategory({ name: 'Reputation' }),
        createMockCategory({ name: 'Operational' }),
      ];
      expect(areImpactCategoriesComplete(categories)).toBe(true);
    });
  });

  describe('isMatrixComplete', () => {
    it.each([
      {
        likelihoodCount: 0,
        impactCount: 3,
        reason: 'likelihoodCount is 0',
      },
      {
        likelihoodCount: 3,
        impactCount: 0,
        reason: 'impactCount is 0',
      },
      {
        likelihoodCount: 0,
        impactCount: 0,
        reason: 'both counts are 0',
      },
    ])('returns false when $reason', ({ likelihoodCount, impactCount }) => {
      expect(
        isMatrixComplete(
          createMockMatrixEntries(1, 1),
          likelihoodCount,
          impactCount
        )
      ).toBe(false);
    });

    it('returns false when matrix is empty but counts > 0', () => {
      expect(isMatrixComplete([], 3, 3)).toBe(false);
    });

    it('returns false when entry has empty title', () => {
      const entries = createMockMatrixEntries(1, 1).map((e) => ({
        ...e,
        title: '',
      }));
      expect(isMatrixComplete(entries, 1, 1)).toBe(false);
    });

    it('returns false when entry has null title', () => {
      const entries = createMockMatrixEntries(1, 1).map((e) => ({
        ...e,
        title: null as unknown as string,
      }));
      expect(isMatrixComplete(entries, 1, 1)).toBe(false);
    });

    it('returns false when entry has whitespace-only title', () => {
      const entries = createMockMatrixEntries(1, 1).map((e) => ({
        ...e,
        title: '   ',
      }));
      expect(isMatrixComplete(entries, 1, 1)).toBe(false);
    });

    it('returns false when entry has null value', () => {
      const entries = createMockMatrixEntries(1, 1).map((e) => ({
        ...e,
        value: null as unknown as number,
      }));
      expect(isMatrixComplete(entries, 1, 1)).toBe(false);
    });

    it('returns false when entry has undefined value', () => {
      const entries = createMockMatrixEntries(1, 1).map((e) => ({
        ...e,
        value: undefined as unknown as number,
      }));
      expect(isMatrixComplete(entries, 1, 1)).toBe(false);
    });

    it('returns false when cells covered < expected (3x3 with only 8 cells)', () => {
      const entries = createMockMatrixEntries(3, 3).slice(0, 8);
      expect(isMatrixComplete(entries, 3, 3)).toBe(false);
    });

    it('returns false when matrix has duplicate (likelihood, impact) pairs causing missing cells (3x3 with 9 entries but only 8 unique pairs)', () => {
      const entries = [
        ...createMockMatrixEntries(3, 3).slice(0, 8),
        {
          title: 'Duplicate',
          value: 5,
          color: '#ff0000',
          likelihood: 1,
          impact: 1,
        },
      ];
      expect(isMatrixComplete(entries, 3, 3)).toBe(false);
    });

    it('returns true when all cells are covered even with extra duplicate entries (3x3 with 10 entries)', () => {
      const entries = [
        ...createMockMatrixEntries(3, 3),
        {
          title: 'Duplicate',
          value: 5,
          color: '#ff0000',
          likelihood: 1,
          impact: 1,
        },
      ];
      expect(isMatrixComplete(entries, 3, 3)).toBe(true);
    });

    it.each([
      { dimensions: [2, 2], reason: '2x2' },
      { dimensions: [3, 3], reason: '3x3' },
      { dimensions: [4, 5], reason: '4x5 non-square' },
    ])('returns true for $reason matrix fully covered', ({ dimensions }) => {
      const [likelihood, impact] = dimensions;
      const matrix = createMockMatrixEntries(likelihood, impact);
      expect(isMatrixComplete(matrix, likelihood, impact)).toBe(true);
    });

    it('returns true for multiple entries covering all cells', () => {
      const matrix: MatrixCell[] = [
        { title: 'Low', value: 1, color: '#00ff00', likelihood: 1, impact: 1 },
        { title: 'Low', value: 1, color: '#00ff00', likelihood: 1, impact: 2 },
        { title: 'High', value: 5, color: '#ff0000', likelihood: 2, impact: 1 },
        { title: 'High', value: 5, color: '#ff0000', likelihood: 2, impact: 2 },
      ];
      expect(isMatrixComplete(matrix, 2, 2)).toBe(true);
    });
  });
});
