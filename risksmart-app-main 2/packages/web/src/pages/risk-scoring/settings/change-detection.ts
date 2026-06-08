import type { ImpactCategory, MatrixCell, RiskScoringLevel } from 'src/blocks';

import type { ScoringSettingsData } from './useRiskScoringSettingsStore';

export type ChangeStatus = 'none' | 'cosmetic' | 'structural';

export const analyzeChanges = (
  initial: ScoringSettingsData,
  current: ScoringSettingsData
): ChangeStatus => {
  if (hasStructuralChanges(initial, current)) {
    return 'structural';
  }

  if (hasCosmeticChanges(initial, current)) {
    return 'cosmetic';
  }

  return 'none';
};

/** Has structural changes when any of the core scoring settings have been modified */
const hasStructuralChanges = (
  initial: ScoringSettingsData,
  current: ScoringSettingsData
): boolean => {
  // Likelihood rating values (added, removed, or modified)
  const initialLikelihoodValues = initial.likelihoodLevels
    .map((l) => l.value)
    .sort((a, b) => a - b);
  const currentLikelihoodValues = current.likelihoodLevels
    .map((l) => l.value)
    .sort((a, b) => a - b);
  if (!arraysEqual(initialLikelihoodValues, currentLikelihoodValues)) {
    return true;
  }

  // Impact rating values (added, removed, or modified)
  const initialImpactValues = initial.impactLevels
    .map((l) => l.value)
    .sort((a, b) => a - b);
  const currentImpactValues = current.impactLevels
    .map((l) => l.value)
    .sort((a, b) => a - b);
  if (!arraysEqual(initialImpactValues, currentImpactValues)) {
    return true;
  }

  // Impact categories count
  if (initial.impactCategories.length !== current.impactCategories.length) {
    return true;
  }

  // Aggregation method
  if (initial.impactAggregation !== current.impactAggregation) {
    return true;
  }

  // Matrix: per-cell comparison keyed by likelihood-impact pair
  const initialCellMap = buildCellValueMap(initial.matrix);
  const currentCellMap = buildCellValueMap(current.matrix);

  if (initialCellMap.size !== currentCellMap.size) {
    return true;
  }

  let hasChange = false;
  initialCellMap.forEach((value, key) => {
    if (currentCellMap.get(key) !== value) {
      hasChange = true;
    }
  });

  return hasChange;
};

/** Has cosmetic changes when any of the non-core scoring settings (i.e., titles, descriptions, colors) have been modified */
const hasCosmeticChanges = (
  initial: ScoringSettingsData,
  current: ScoringSettingsData
): boolean =>
  !areLevelsEqualCosmetic(initial.likelihoodLevels, current.likelihoodLevels) ||
  !areLevelsEqualCosmetic(initial.impactLevels, current.impactLevels) ||
  !areCategoriesEqualCosmetic(
    initial.impactCategories,
    current.impactCategories
  ) ||
  !areMatrixEntriesEqualCosmetic(initial.matrix, current.matrix);

const areLevelsEqualCosmetic = (
  a: RiskScoringLevel[],
  b: RiskScoringLevel[]
): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((level, i) => {
    const other = b[i];

    return (
      level.title === other.title &&
      level.description === other.description &&
      level.color === other.color
    );
  });
};

const areCategoriesEqualCosmetic = (
  a: ImpactCategory[],
  b: ImpactCategory[]
): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((category, i) => {
    const other = b[i];

    return category.name === other.name && category.color === other.color;
  });
};

const areMatrixEntriesEqualCosmetic = (
  a: MatrixCell[],
  b: MatrixCell[]
): boolean => {
  const mapA = buildCellCosmeticMap(a);
  const mapB = buildCellCosmeticMap(b);

  if (mapA.size !== mapB.size) {
    return false;
  }

  let isEqual = true;
  mapA.forEach((cosmetic, key) => {
    const other = mapB.get(key);
    if (
      !other ||
      cosmetic.title !== other.title ||
      cosmetic.color !== other.color
    ) {
      isEqual = false;
    }
  });

  return isEqual;
};

const buildCellValueMap = (matrix: MatrixCell[]): Map<string, number> => {
  const map = new Map<string, number>();
  for (const entry of matrix) {
    map.set(`${entry.likelihood}-${entry.impact}`, entry.value);
  }

  return map;
};

const buildCellCosmeticMap = (
  matrix: MatrixCell[]
): Map<string, { title: string; color: string }> => {
  const map = new Map<string, { title: string; color: string }>();
  for (const entry of matrix) {
    map.set(`${entry.likelihood}-${entry.impact}`, {
      title: entry.title,
      color: entry.color,
    });
  }

  return map;
};

const arraysEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);
