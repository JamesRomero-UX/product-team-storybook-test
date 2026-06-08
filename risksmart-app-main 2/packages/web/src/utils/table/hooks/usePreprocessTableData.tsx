import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { notEmpty } from 'src/utilityTypes';

import type {
  Dataset,
  RootTablePropsOptions,
  TablePreferences,
  TableRecord,
} from '../types';
import { useAddCustomAttributes } from './useAddCustomAttributes';
import { useCreateColumnDefinitions } from './useCreateColumnDefinitions';
import { useCreateFilterProperties } from './useCreateFilterProperties';
import { useTablePreferences } from './useTablePreferences';

type UsePreprocessTableDataOptions<T extends TableRecord> =
  RootTablePropsOptions<T, Dataset<T>> & {
    currentPage?: number;
    defaultPreferences?: CollectionPreferencesProps.Preferences;
    preferences: TablePreferences<T> | undefined;
    /**
     * Form configurations required to resolve form labels (used in headings)
     */
    labelFormConfigurations: FormConfigurationPartsFragment[] | null;
    /**
     * Form configurations required to show custom attributes in the table
     */
    customAttributeFormConfigurations: FormConfigurationPartsFragment[] | null;
  };

export const usePreprocessTableData = <T extends TableRecord>(
  options: UsePreprocessTableDataOptions<T>
) => {
  const customAttributeSchema = useMemo(
    () =>
      options.customAttributeFormConfigurations
        ?.map((fc) => fc.customAttributeSchema)
        .filter(notEmpty) || [],
    [options.customAttributeFormConfigurations]
  );

  const { tableFields, tableData } = useAddCustomAttributes({
    data: options.data,
    fields: options.fields,
    customAttributeSchema,
    useRelativeDates: !!options.usesRelativeCustomAttributeDates,
  });

  const preferences = useTablePreferences({
    preferences: options.preferences,
    tableFields,
    initialColumns: options.initialColumns,
    defaultPreferences: options.defaultPreferences,
    initialVisibleContent: options.initialVisibleContent,
  });

  const columnDefinitions = useCreateColumnDefinitions({
    tableFields,
    columnWidths: preferences.custom?.columnWidths,
    labelFormConfigurations: options.labelFormConfigurations,
  });
  const filteringProperties = useCreateFilterProperties(
    tableFields,
    options.labelFormConfigurations
  );

  return {
    columnDefinitions,
    filteringProperties,
    preferences,
    tableData,
    tableFields,
  };
};
