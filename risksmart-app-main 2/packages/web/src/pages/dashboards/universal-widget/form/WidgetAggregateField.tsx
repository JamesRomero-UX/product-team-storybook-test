import type { FieldValues } from 'react-hook-form';
import ControlledSelect from 'src/components/form/controlled-select';
import type { ControlledBaseProps } from 'src/components/form/types';

import { useGetWidgetData } from '../../gigawidget/hooks/useGetWidgetData';
import type { WidgetDataSource } from '../../gigawidget/types';

interface Props<
  TDataSource extends WidgetDataSource,
  T extends FieldValues,
> extends ControlledBaseProps<T> {
  dataSource: TDataSource;
  testId: string;
}

export const WidgetAggregateField = <
  TDataSource extends WidgetDataSource,
  T extends FieldValues,
>({
  dataSource,
  control,
  name,
  testId,
}: Props<TDataSource, T>) => {
  const { tableProps } = useGetWidgetData({
    dataSource,
    disableDashboardFilters: true,
  });
  const numberFields = tableProps.columnDefinitions.filter((c) => {
    if (tableProps.allItems?.[0] === undefined) {
      return false;
    }
    if (!c.id) {
      return false;
    }
    // bit of a hack to hide ID fields from the aggregation options
    if (typeof c.header === 'string' && /\bid\b/i.test(c.header)) {
      return false;
    }
    if (!Object.prototype.hasOwnProperty.call(tableProps.allItems[0], c.id)) {
      return false;
    }

    if (
      tableProps.allItems
        .map((item) => item[c.id!])
        .every(
          (item) =>
            typeof item === 'number' || item === null || item === undefined
        )
    ) {
      return true;
    }
  });

  return (
    <ControlledSelect
      placeholder={'Aggregate field'} // TODO: translation
      name={name}
      label={'Aggregate field'} // TODO: translation
      control={control}
      testId={testId}
      options={numberFields.map((f) => ({
        value: f.id,
        label: f.header as string,
      }))}
    />
  );
};
