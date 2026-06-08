import type { MutableRefObject } from 'react';

export type HeatmapCellData = {
  value: number | string;
  background: string;
  label?: string;
};

export type HeatmapCellProps = {
  data: HeatmapCellData;
  onClick?: (data: HeatmapCellData) => void;
  onMouseOver: (
    ref: MutableRefObject<HTMLDivElement | null>,
    data: HeatmapCellData
  ) => void;
  className?: string;
};

export type TooltipData = {
  data: HeatmapCellData;
  ref: MutableRefObject<HTMLDivElement | null>;
  x: number;
  y: number;
};

export type CellClickData = {
  data: HeatmapCellData;
  x: number;
  y: number;
};
