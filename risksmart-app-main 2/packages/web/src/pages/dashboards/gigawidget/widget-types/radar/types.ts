// For Highcharts radar charts, we use column charts in polar coordinates
export type RadarSeries<T> = {
  readonly data: readonly { x: T; y: number; color?: string }[];
  type: 'column';
  title: string;
  color?: string;
};
