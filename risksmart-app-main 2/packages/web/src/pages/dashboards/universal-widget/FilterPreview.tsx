import PropertyFilterPanel from 'src/components/property-filter-panel';

import { emptyFilterQuery } from '@/utils/table/types';

import { useGetWidgetData } from '../gigawidget/hooks/useGetWidgetData';
import type { WidgetDataSource } from '../gigawidget/types';
import styles from './style.module.scss';
import type { GigawidgetSettings } from './util';

type FilterPreviewProps = {
  dataSource: WidgetDataSource;
  settings: GigawidgetSettings;
};

export const FilterPreview = ({ dataSource, settings }: FilterPreviewProps) => {
  const { tableProps, loading } = useGetWidgetData({ dataSource });

  return (
    <>
      {!loading && (
        <PropertyFilterPanel
          {...{ className: styles.filterPreview }}
          query={settings.filtering ?? emptyFilterQuery}
          filteringProperties={tableProps.filteringProperties}
          filteringOptions={tableProps.propertyFilterProps.filteringOptions}
          onChange={() => null}
          customControl={<></>}
          customFilterActions={<></>}
          hideOperations={false}
          disabled
          virtualScroll={true}
        />
      )}
    </>
  );
};
