import { useMemo } from 'react';

import type {
  CustomContentDisplayItem,
  TablePreferences,
  TableRecord,
} from '../types';
import { updateContentDisplayItems } from '../utils/updateContentDisplayItems';
import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';
import { useGetDefaultTablePreferences } from './useGetDefaultTablePreferences';

type TablePreferenceOptions<T extends TableRecord> = {
  preferences: TablePreferences<T> | undefined;
  initialColumns?: (keyof T)[];
  tableFields: TableFieldsWithCustomAttributes<T>;
  defaultPreferences?: TablePreferences<T>;
  initialVisibleContent?: readonly string[];
};

export const useTablePreferences = <T extends TableRecord>({
  initialColumns,
  preferences,
  tableFields,
  defaultPreferences,
  initialVisibleContent,
}: TablePreferenceOptions<T>): TablePreferences<T> => {
  const initialStorageValue = useGetDefaultTablePreferences(
    tableFields,
    initialColumns,
    initialVisibleContent,
    defaultPreferences
  );

  return useMemo<TablePreferences<T>>(
    () => ({
      ...initialStorageValue,
      ...preferences,
      contentDisplay: updateContentDisplayItems(
        (preferences?.contentDisplay as CustomContentDisplayItem[]) || [],
        (initialStorageValue.contentDisplay as CustomContentDisplayItem[]) || []
      ),
    }),
    [preferences, initialStorageValue]
  );
};
