import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type { SortingState } from '@risksmart-app/components/src/table/tableUtils';
import { useState } from 'react';

import { useOrgScopedLocalStorage } from '@/hooks/useOrgScopedLocalStorage';

import type { TablePreferences, TablePropsWithActions } from '../types';
import type { UseGetTablePropsOptions } from './useGetStatelessTableProps';
import { useGetStatelessTableProps } from './useGetStatelessTableProps';

export function useGetTablePropsWithoutUrlHash<
  T extends Record<string, unknown>,
>(options: UseGetTablePropsOptions<T>): TablePropsWithActions<T> {
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilterQuery>();
  const [sortingState, setSortingState] = useState<SortingState<T>>();

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
  });
}
