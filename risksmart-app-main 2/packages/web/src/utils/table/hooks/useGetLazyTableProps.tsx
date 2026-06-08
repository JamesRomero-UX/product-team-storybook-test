import type { Order_By } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useEffect, useMemo, useState } from 'react';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import NoMatchesCollection from 'src/components/empty-collection/NoMatchesCollection';

import { useOrgScopedLocalStorage } from '@/hooks/useOrgScopedLocalStorage';

import type {
  CollectionActions,
  TablePreferences,
  TablePropsWithActions,
} from '../types';
import type {
  LazyDataset,
  RootTablePropsOptions,
  TableRecord,
  WhereFilter,
} from '../types';
import { emptyFilterQuery } from '../types';
import {
  propertyFilterToGraphQLQuery,
  sortingStateToGraphQLQuery,
} from '../utils/serversideUtils';
import { useBuildTableProps } from './useBuildTableProps';
import { useCreateFilterOptions } from './useCreateFilterOptions';
import { useFiltersFromUrlHash } from './useFiltersFromUrlHash';
import { useGetTableFormCustomisationData } from './useGetTableFormCustomisationData';
import { usePreprocessTableData } from './usePreprocessTableData';

type UseGetTablePropsOptions<T extends TableRecord> = RootTablePropsOptions<
  T,
  LazyDataset<T>
>;

export function useGetLazyTableProps<T extends Record<string, unknown>>(
  options: UseGetTablePropsOptions<T>
): TablePropsWithActions<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const labelFormConfigurations = useGetTableFormCustomisationData(
    options.fields,
    options.customAttributeFormIds
  );

  const [storedPreferences, setPreferences] = useOrgScopedLocalStorage<
    TablePreferences<T> | undefined
  >(undefined, {
    localStorageKey: options.preferencesStorageKey,
  });

  const [pagesCount, setPageCount] = useState<null | number>(null);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const customAttributeFormConfigurations = useMemo(
    () =>
      labelFormConfigurations.filter((fc) =>
        options.customAttributeFormIds.includes(fc.ParentType)
      ),
    [labelFormConfigurations, options.customAttributeFormIds]
  );

  const {
    columnDefinitions,
    filteringProperties,
    tableData,
    tableFields,
    preferences,
  } = usePreprocessTableData({
    ...options,
    currentPage,
    data,
    preferences: storedPreferences,
    customAttributeFormConfigurations,
    labelFormConfigurations,
  });

  const { sortingState, setSortingState, propertyFilter, setPropertyFilter } =
    useFiltersFromUrlHash<T>({
      fields: tableFields,
      defaultSortingState: options.defaultSortingState,
      hasTokenGroupsEnabled: false,
      isLazyLoaded: true,
    });

  const filteringOptions = useCreateFilterOptions(tableFields, tableData, []);

  useEffect(() => {
    if (preferences.pageSize === undefined || loading) {
      return;
    }

    if (!Array.isArray(options.data)) {
      if (currentPage === undefined) {
        return;
      }

      setLoading(true);
      const pages = preferences.pageSize;

      options
        .data?.({
          limit: pages,
          offset: (currentPage - 1) * pages,
          orderBy: (sortingState
            ? sortingStateToGraphQLQuery(sortingState)
            : {}) as Record<keyof T, Order_By>,
          where: propertyFilter
            ? propertyFilterToGraphQLQuery(propertyFilter)
            : ({} as WhereFilter<T>),
        })
        .then(({ data, totalCount }) => {
          if (totalCount !== undefined) {
            setPageCount(Math.ceil(totalCount / pages));
          }
          setData(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.pageSize, currentPage, sortingState, propertyFilter]);

  return useBuildTableProps({
    labelFormConfigurations,
    items: tableData,
    allPageItems: tableData,
    allItems: tableData,
    preferences: preferences,
    setPreferences: setPreferences,
    entityLabel: options.entityLabel,
    columnDefinitions: columnDefinitions,
    tableFields: tableFields,
    filtersEnabled: options.enableFiltering ?? true,
    propertyFilterProps: {
      filteringProperties,
      filteringOptions,
      // Enforce 'AND' operation for server-side filtering, 'OR' doesn't work.
      query: { ...(propertyFilter ?? emptyFilterQuery), operation: 'and' },
      onChange: ({ detail }) => setPropertyFilter(detail),
      hideOperations: true,
      enableTokenGroups: false,
      disableFreeTextFiltering: true,
    },
    paginationProps: {
      pagesCount: pagesCount ?? 0,
      openEnd: pagesCount === null,
      currentPageIndex: currentPage,
      onChange: (event) => setCurrentPage(event.detail.currentPageIndex),
    },
    actions: {} as CollectionActions<T>,
    onPropertyFilterChange: setPropertyFilter,
    onSortingChange: setSortingState,
    extraProps: {
      sortingColumn:
        sortingState?.sortingColumn ??
        (options.defaultSortingState?.sortingColumn
          ? {
              sortingField: options.defaultSortingState.sortingColumn as string,
            }
          : undefined),
      sortingDescending:
        sortingState?.isDescending ??
        options.defaultSortingState?.sortingDirection === 'desc',
      loading,
      empty: !propertyFilter ? (
        <EmptyEntityCollection
          entityLabel={options.entityLabel}
          action={options.emptyCollectionAction || <></>}
        />
      ) : (
        <NoMatchesCollection
          onClearClick={() => setPropertyFilter(emptyFilterQuery)}
        />
      ),
    },
  });
}
