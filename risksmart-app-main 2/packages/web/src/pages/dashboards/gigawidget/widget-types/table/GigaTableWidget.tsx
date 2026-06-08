import _ from 'lodash';
import type { GigawidgetSettings } from 'src/pages/dashboards/universal-widget/util';
import TableWidget from 'src/pages/dashboards/widgets/table-widget/TableWidget';

import type { TablePreferences } from '@/utils/table/types';

import { useDashboardWidgetSettings } from '../../../../../context/useDashboardWidgetSettings';
import { useGetWidgetData } from '../../hooks/useGetWidgetData';
import type {
  DataSourceVariables,
  GigawidgetCommonProps,
  WidgetDataSource,
} from '../../types';

export type GigaTableWidgetProps<TDataSource extends WidgetDataSource> =
  GigawidgetCommonProps<TDataSource>;

export const GigaTableWidget = <TDataSource extends WidgetDataSource>({
  dataSource,
  variables,
  dateFilterOptions,
  propertyFilterQuery,
}: GigaTableWidgetProps<TDataSource>) => {
  const [settings, setSettings] =
    useDashboardWidgetSettings<GigawidgetSettings>();

  const { tableProps } = useGetWidgetData({
    dataSource,
    variables,
    dateFilterOptions,
    propertyFilterQuery,
    tableOptions: {
      sortingState: settings?.sorting,
      setSortingState: (sorting) => {
        setSettings({
          ...(settings as GigawidgetSettings),
          sorting: sorting as GigawidgetSettings['sorting'],
        });
      },
      preferences: {
        ...settings?.preferences,
        pageSize: settings?.preferences?.pageSize ?? 10,
      } as TablePreferences<DataSourceVariables<TDataSource>>,
      setPreferences: (preferences) => {
        setSettings({
          ...(settings as GigawidgetSettings),
          preferences,
        });
      },
      setPropertyFilter: _.noop,
    },
  });

  return <TableWidget tableProps={tableProps} />;
};
