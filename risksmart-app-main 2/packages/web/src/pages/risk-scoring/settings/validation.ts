import type { ImpactCategory, MatrixCell, RiskScoringLevel } from 'src/blocks';

const isNonEmpty = (value: string | null | undefined): boolean =>
  value != null && value.trim().length > 0;

/** Levels are valid when > 1 level exists and all have value, non-empty title, description & color */
function areLevelsComplete(levels: RiskScoringLevel[]): boolean {
  return (
    levels.length > 1 &&
    levels.every(
      (l) =>
        l.value != null &&
        isNonEmpty(l.title) &&
        isNonEmpty(l.description) &&
        isNonEmpty(l.color)
    )
  );
}

/** Likelihood levels are valid when > 1 level exists and all have value, non-empty title, description & color */
export function areLikelihoodLevelsComplete(
  levels: RiskScoringLevel[]
): boolean {
  return areLevelsComplete(levels);
}

/** Impact levels are valid when > 1 level exists and all have value, non-empty title, description & color */
export function areImpactLevelsComplete(levels: RiskScoringLevel[]): boolean {
  return areLevelsComplete(levels);
}

/** Impact categories are valid when > 1 category exists and all have non-empty name & color */
export function areImpactCategoriesComplete(
  categories: ImpactCategory[]
): boolean {
  return (
    categories.length > 1 &&
    categories.every((c) => isNonEmpty(c.name) && isNonEmpty(c.color))
  );
}

/** Matrix is valid when every entry has a non-empty title and a value, and all likelihood x impact cells are covered */
export function isMatrixComplete(
  matrix: MatrixCell[],
  likelihoodCount: number,
  impactCount: number
): boolean {
  if (likelihoodCount === 0 || impactCount === 0) {
    return false;
  }

  const hasValidEntries = matrix.every(
    (entry) => isNonEmpty(entry.title) && entry.value != null
  );

  const expectedCells = likelihoodCount * impactCount;
  const uniqueCells = new Set(
    matrix.map((entry) => `${entry.likelihood}-${entry.impact}`)
  ).size;

  return hasValidEntries && uniqueCells === expectedCells;
}
