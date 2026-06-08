import type { DataSeries } from '../../hooks/useDataSeries';

export interface LineSeries<T> extends Omit<DataSeries<T>, 'type'> {
  type: 'line';
}
