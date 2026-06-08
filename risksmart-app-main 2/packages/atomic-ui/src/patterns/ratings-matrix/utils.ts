import type { MatrixCell } from './types';

export function buildMatrixGrid(matrix: MatrixCell[]): Map<string, MatrixCell> {
  const grid = new Map<string, MatrixCell>();

  for (const entry of matrix) {
    const key = `${entry.likelihood}-${entry.impact}`;
    grid.set(key, entry);
  }

  return grid;
}

export function getCellData(
  grid: Map<string, MatrixCell>,
  likelihood: number,
  impact: number
): MatrixCell | undefined {
  return grid.get(`${likelihood}-${impact}`);
}
