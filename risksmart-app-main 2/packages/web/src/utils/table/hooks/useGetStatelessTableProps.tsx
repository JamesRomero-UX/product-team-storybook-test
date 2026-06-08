import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import { useCollection } from '@cloudscape-design/collection-hooks';
import type { SortingState } from '@risksmart-app/components/src/table/tableUtils';
import { useEffect, useMemo } from 'react';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import NoMatchesCollection from 'src/components/empty-collection/NoMatchesCollection';

import type {
  Dataset,
  RootTablePropsOptions,
  TablePreferences,
  TablePropsWithActions,
  TableRecord,
} from '../types';
import { emptyFilterQuery } from '../types';
import { useBuildTableProps } from './useBuildTableProps';
import { useCreateFilterOptions } from './useCreateFilterOptions';
import { useGetTableFormCustomisationData } from './useGetTableFormCustomisationData';
import { usePreprocessTableData } from './usePreprocessTableData';

export type UseGetTablePropsOptions<T extends TableRecord> =
  RootTablePropsOptions<T, Dataset<T>>;

export type StatefulTableOptions<T extends TableRecord> = {
  sortingState: SortingState<T> | undefined;
  setSortingState: (sortingState: SortingState<T>) => void;
  propertyFilter: PropertyFilterQuery | undefined;
  setPropertyFilter: (propertyFilter: PropertyFilterQuery) => void;
  preferences: TablePreferences<T> | undefined;
  setPreferences: (preferences: TablePreferences<T> | undefined) => void;
  hideNoMatchClearButton?: boolean;
  loadingFilters?: boolean;
};

type UseGetStatelessTablePropsOptions<T extends TableRecord> =
  UseGetTablePropsOptions<T> & StatefulTableOptions<T>;

export function useGetStatelessTableProps<T extends TableRecord>(
  options: UseGetStatelessTablePropsOptions<T>
): TablePropsWithActions<T> {
  const labelFormConfigurations = useGetTableFormCustomisationData(
    options.fields,
    options.customAttributeFormIds
  );
  const customAttributeFormConfigurations = useMemo(
    () =>
      labelFormConfigurations.filter((fc) =>
        options.customAttributeFormIds.includes(fc.ParentType)
      ),
    [labelFormConfigurations, options.customAttributeFormIds]
  );

  const {
    sortingState,
    setSortingState,
    propertyFilter,
    setPropertyFilter,
    setPreferences,
    loadingFilters,
  } = options;
  const {
    columnDefinitions,
    filteringProperties,
    tableData,
    tableFields,
    preferences,
  } = usePreprocessTableData({
    ...options,
    labelFormConfigurations,
    customAttributeFormConfigurations,
  });

  const collection = useCollection(tableData || [], {
    propertyFiltering: {
      filteringProperties,
      noMatch: (
        <NoMatchesCollection
          hideClearButton={options.hideNoMatchClearButton}
          onClearClick={() => {
            setPropertyFilter(emptyFilterQuery);
            collection.actions.setPropertyFiltering(emptyFilterQuery);
          }}
        />
      ),
      empty: (
        <EmptyEntityCollection
          entityLabel={options.entityLabel}
          action={options.emptyCollectionAction || <></>}
        />
      ),
    },
    pagination: {
      pageSize: preferences?.pageSize,
    },
    sorting: {
      defaultState: options.defaultSortingState
        ? {
            sortingColumn:
              columnDefinitions.find(
                (c) => c.id === options.defaultSortingState?.sortingColumn
              ) ?? columnDefinitions[0],
            isDescending:
              options.defaultSortingState?.sortingDirection === 'desc',
          }
        : {
            sortingColumn: columnDefinitions[0],
          },
    },
  });

  const filteringOptions = useCreateFilterOptions(
    tableFields,
    tableData,
    collection.propertyFilterProps.filteringOptions
  );

  useEffect(() => {
    if (
      sortingState &&
      (sortingState.isDescending !==
        collection.collectionProps.sortingDescending ||
        JSON.stringify(sortingState.sortingColumn) !==
          JSON.stringify(collection.collectionProps.sortingColumn))
    ) {
      collection.actions.setSorting(sortingState);
    }
  }, [
    sortingState,
    collection.actions,
    collection.collectionProps.sortingColumn,
    collection.collectionProps.sortingDescending,
  ]);

  useEffect(() => {
    if (
      propertyFilter &&
      JSON.stringify(propertyFilter) !==
        JSON.stringify(collection.propertyFilterProps.query)
    ) {
      collection.actions.setPropertyFiltering(propertyFilter);
    }
  }, [
    propertyFilter,
    collection.actions,
    collection.propertyFilterProps.query,
  ]);

  const actions = useMemo(
    () => ({ ...collection.actions, setSorting: setSortingState }),
    [collection.actions, setSortingState]
  );

  return useBuildTableProps({
    labelFormConfigurations,
    tableFields,
    allPageItems: collection.allPageItems,
    preferences,
    entityLabel: options.entityLabel,
    columnDefinitions,
    items: collection.items,
    allItems: tableData,
    propertyFilterProps: {
      disabled: loadingFilters,
      filteringProperties,
      filteringOptions,
      enableTokenGroups: true,
      query: propertyFilter ?? emptyFilterQuery,
      onChange: ({ detail }) => setPropertyFilter(detail),
    },
    // If filters are show before data comes back, the number of columns change once the custom attribute data returns, and relative date format can throw errors
    filtersEnabled: (options.enableFiltering && !!options.data) ?? true,
    paginationProps: collection.paginationProps,
    actions,
    setPreferences,
    onSortingChange: setSortingState,
    onPropertyFilterChange: setPropertyFilter,
    extraProps: collection.collectionProps,
    extraFilters: options.extraFilters,
  });
}
