import type { TableRecord } from '@/utils/table/types';

import type { WidgetDataSource } from '../gigawidget/types';

export const createDataSource = <TItem extends TableRecord, TVariables, TData>(
  config: WidgetDataSource<TItem, TVariables, TData>
) => config;
