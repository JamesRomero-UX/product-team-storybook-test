import type { HeatmapCellData } from './types';

export const initializeHeatmapCells = (
  y: number,
  x: number,
  getCellConfig: (
    r: number,
    c: number
  ) => { background: string; label?: string }
): HeatmapCellData[][] => {
  const cells: HeatmapCellData[][] = [];
  for (let r = 0; r < y; r++) {
    const column: HeatmapCellData[] = [];
    for (let c = 0; c < x; c++) {
      const cellData = getCellConfig(r, c);
      column.push({
        value: 0,
        background: cellData.background,
        label: cellData.label,
      });
    }
    cells.push(column);
  }

  return cells;
};
