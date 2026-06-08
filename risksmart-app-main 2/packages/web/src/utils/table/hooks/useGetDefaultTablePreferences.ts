import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import { useMemo } from 'react';

import type {
  CustomContentDisplayItem,
  TableFields,
  TablePreferences,
  TableRecord,
} from '../types';

const DEFAULT_PREFERENCES = {
  pageSize: 25,
  visibleContent: [],
  wrapLines: false,
  stripedRows: false,
  contentDensity: 'comfortable',
} as const satisfies CollectionPreferencesProps.Preferences;

export const useGetDefaultTablePreferences = <T extends TableRecord>(
  tableFields: TableFields<T>,
  // Could potentially have an InitialVisible field on the TableField definition instead...
  initialColumns?: (keyof T)[],
  initialVisibleContent?: readonly string[],
  defaultPreferences?: CollectionPreferencesProps.Preferences<unknown>
): TablePreferences<T> => {
  const defaultContentDisplay = useMemo<CustomContentDisplayItem[]>(
    () =>
      Object.entries(tableFields)?.map(([key, value]) => ({
        id: key,
        visible: initialColumns?.includes(key) ?? true,
        custom: value.custom ?? false,
      })) ?? [],
    [tableFields, initialColumns]
  );

  const initialStorageValue: TablePreferences<T> = {
    ...DEFAULT_PREFERENCES,
    ...defaultPreferences,
    visibleContent: initialVisibleContent ?? [],
    contentDisplay: defaultContentDisplay,
    custom: {},
  };

  return initialStorageValue;
};
