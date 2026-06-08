import { useMutation, useQuery } from '@apollo/client';
import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type { SortingState } from '@risksmart-app/components/src/table/tableUtils';
import {
  GetUserTablePreferencesDocument,
  UpsertUserTablePreferencesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useEffect } from 'react';

import type { DefaultSortingState, TableRecord } from '../types';
import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';
import { useFiltersFromUrlHash } from './useFiltersFromUrlHash';

type StorageType<T> = {
  sortingState: SortingState<T> | undefined;
  propertyFilter: PropertyFilterQuery | undefined;
};

/**
 * Store and retrieve filters and sorting in the url after the hash.
 * If the hash does not contain this info, then require from db instead
 *
 * @returns
 */
export const useFiltersFromDBAndUrlHash = <T extends TableRecord>({
  fields,
  defaultSortingState,
  tableId,
}: {
  fields: TableFieldsWithCustomAttributes<T>;
  defaultSortingState?: DefaultSortingState<T> | undefined;
  tableId?: string;
}) => {
  const { data, loading } = useQuery(GetUserTablePreferencesDocument, {
    variables: { TableId: tableId! },
    skip: !tableId,
    fetchPolicy: 'no-cache',
  });
  const preferences = data?.user_table_preferences[0]?.Preferences;
  const [updateTablePreferences] = useMutation(
    UpsertUserTablePreferencesDocument,
    {}
  );
  const result = useFiltersFromUrlHash({
    fields,
    defaultSortingState,
    hasTokenGroupsEnabled: true,
  });
  const { setPropertyFilter, setSortingState, sortingState, propertyFilter } =
    result;

  const saveFilterAndSortState = useCallback(
    ({
      sortingState,
      propertyFilter,
    }: {
      sortingState: SortingState<T> | undefined;
      propertyFilter: PropertyFilterQuery | undefined;
    }) => {
      if (tableId) {
        const state: StorageType<T> = { sortingState, propertyFilter };
        updateTablePreferences({
          variables: {
            Preferences: state,
            TableId: tableId,
          },
        });
      }
    },
    [tableId, updateTablePreferences]
  );

  const setSortingStateInStorage = useCallback(
    (sortingState: SortingState<T>) => {
      setSortingState(sortingState);
      saveFilterAndSortState({ sortingState, propertyFilter });
    },
    [propertyFilter, saveFilterAndSortState, setSortingState]
  );

  const setPropertyFilterInStorage = useCallback(
    (propertyFilter: PropertyFilterQuery) => {
      setPropertyFilter(propertyFilter);
      saveFilterAndSortState({ propertyFilter, sortingState });
    },
    [saveFilterAndSortState, setPropertyFilter, sortingState]
  );

  useEffect(() => {
    if (!preferences || result.sortingState || result.propertyFilter) {
      return;
    }

    if (preferences.propertyFilter || preferences.sortingState) {
      result.setPropertyFilterAndSortingState({
        propertyFilter: preferences.propertyFilter,
        sortingState: preferences.sortingState,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, fields]);

  return {
    ...result,
    loading,
    setPropertyFilter: setPropertyFilterInStorage,
    setSortingState: setSortingStateInStorage,
  };
};
