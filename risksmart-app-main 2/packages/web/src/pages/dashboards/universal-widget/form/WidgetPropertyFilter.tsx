import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import { useMemo } from 'react';
import PropertyFilterPanel from 'src/components/property-filter-panel';

import { useGetWidgetData } from '../../gigawidget/hooks/useGetWidgetData';
import type { WidgetDataSource } from '../../gigawidget/types';
import type { dataSources } from '../data-sources';

type Props<TDataSource extends WidgetDataSource> = {
  value: PropertyFilterQuery;
  onChange: (value: PropertyFilterQuery) => void;
  dataSource: TDataSource;
  dataSourceKey?: keyof typeof dataSources;
  allowOwnershipFiltering?: boolean;
};

export const WidgetPropertyFilter = <TDataSource extends WidgetDataSource>({
  dataSource,
  value,
  onChange,
  dataSourceKey,
  allowOwnershipFiltering,
}: Props<TDataSource>) => {
  const {
    loading,
    tableProps: { propertyFilterProps },
  } = useGetWidgetData({ dataSource, disableDashboardFilters: true });

  const filteringProperties = useMemo(() => {
    if (loading) {
      return [];
    }

    if (!allowOwnershipFiltering) {
      return propertyFilterProps.filteringProperties;
    }

    // Certain properties are not relevant for the My Items dashboard
    return propertyFilterProps.filteringProperties.filter((p) => {
      return (
        !['allOwners', 'allContributors'].includes(p.key) &&
        !(dataSourceKey === 'attestations' && p.key === 'User') &&
        !(
          dataSourceKey === 'changeRequests' &&
          ['allApprovers', 'currentApprovers', 'nextApprovers'].includes(p.key)
        )
      );
    });
  }, [
    dataSourceKey,
    allowOwnershipFiltering,
    loading,
    propertyFilterProps.filteringProperties,
  ]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <PropertyFilterPanel
      i18nStrings={{
        ...defaultPropertyFilterI18nStrings,
      }}
      query={value}
      onChange={(e) => onChange({ ...e.detail })}
      filteringProperties={filteringProperties}
      filteringOptions={propertyFilterProps.filteringOptions}
      hideOperations={false}
      virtualScroll={true}
    />
  );
};
