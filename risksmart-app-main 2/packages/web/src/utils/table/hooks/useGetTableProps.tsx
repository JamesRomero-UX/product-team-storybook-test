import { useMemo } from 'react';
import { notEmpty } from 'src/utilityTypes';

import { useOrgScopedLocalStorage } from '@/hooks/useOrgScopedLocalStorage';
import { useGetTableFormCustomisationData } from '@/utils/table/hooks/useGetTableFormCustomisationData';

import type { TablePreferences, TablePropsWithActions } from '../types';
import { useAddCustomAttributes } from './useAddCustomAttributes';
import { useFiltersFromDBAndUrlHash } from './useFiltersFromDBAndUrlHash';
import type { UseGetTablePropsOptions } from './useGetStatelessTableProps';
import { useGetStatelessTableProps } from './useGetStatelessTableProps';

export function useGetTableProps<T extends Record<string, unknown>>(
  options: UseGetTablePropsOptions<T>
): TablePropsWithActions<T> {
  const tableFormCustomisationData = useGetTableFormCustomisationData(
    options.fields,
    options.customAttributeFormIds
  );

  const customAttributeSchema = useMemo(
    () =>
      tableFormCustomisationData
        ?.map((fc) => fc.customAttributeSchema)
        .filter(notEmpty) || [],
    [tableFormCustomisationData]
  );

  const { tableFields } = useAddCustomAttributes({
    data: options.data,
    fields: options.fields,
    customAttributeSchema,
    useRelativeDates: !!options.usesRelativeCustomAttributeDates,
  });

  const {
    sortingState,
    setSortingState,
    propertyFilter,
    setPropertyFilter,
    loading,
  } = useFiltersFromDBAndUrlHash<T>({
    fields: tableFields,
    tableId: options.tableId,
  });

  const [preferences, setPreferences] = useOrgScopedLocalStorage<
    TablePreferences<T> | undefined
  >(undefined, {
    localStorageKey: options.preferencesStorageKey,
  });

  return useGetStatelessTableProps({
    ...options,
    sortingState,
    setSortingState,
    propertyFilter,
    setPropertyFilter,
    preferences,
    setPreferences,
    loadingFilters: loading,
  });
}
