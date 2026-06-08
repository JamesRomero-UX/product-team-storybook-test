import type { PieChartProps } from '@risk-smart/themed-cloudscape-components/pie-chart';

import type {
  AggregationType,
  CategoricalGigawidgetCommonProps,
  CategoryType,
  DataSourceItem,
  GigawidgetCommonProps,
  WidgetDataSource,
} from '../../types';

type CountFormatter = (
  datum: PieChartProps.Datum,
  sum: number
) => {
  key: string;
  value: string;
};

export type GigaPieWidgetProps<
  TDataSource extends WidgetDataSource,
  TCategory extends CategoryType,
> = GigawidgetCommonProps<TDataSource> &
  CategoricalGigawidgetCommonProps<TDataSource, TCategory> & {
    donut?: boolean;
    countFormatter?: CountFormatter;
    aggregationType?: AggregationType;
    aggregationField?: keyof DataSourceItem<TDataSource>;
    showAsPercentage?: boolean;
  };
