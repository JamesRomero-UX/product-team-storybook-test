import type { PropertyFilterOption } from '@cloudscape-design/collection-hooks';
import { useMemo } from 'react';

import type { TableFields, TableRecord } from '../types';

/*
NOTE: useCollection doesn't support nested objects, so items like tags get turning into a string [object, object] in the filtering options
 https://github.com/cloudscape-design/collection-hooks/issues/30
The current recommendation is to flatten the data.

This gets around the issue by adding all tags as drop down options on the filter input
*/

/**
 * Create additional filterOptions (auto complete) when filtering a property
 * @param tableFields
 * @returns
 */
export const useCreateFilterOptions = <T extends TableRecord>(
  tableFields: TableFields<T>,
  records: T[] | undefined,
  filterOptions: readonly PropertyFilterOption[]
) => {
  return useMemo((): PropertyFilterOption[] => {
    const fieldsToRemove: string[] = [];

    const filterOptionsToAdd = Object.entries(tableFields).flatMap(
      ([fieldName, fieldConfig]) => {
        const { filteringOptions } = fieldConfig.filterOptions ?? {};

        const options =
          typeof filteringOptions === 'function'
            ? filteringOptions(records ?? [])
            : filteringOptions;
        if (options) {
          fieldsToRemove.push(fieldName);
        }

        return (
          options?.map((option) => ({
            ...option,
            propertyKey:
              fieldConfig.filterOptions?.filteringProperties?.key || fieldName,
          })) ?? []
        );
      }
    );

    // Remove [object, object] on tags.
    const filterOptionsWithItemsRemoved = filterOptions.filter(
      (f) => !fieldsToRemove.includes(f.propertyKey)
    );

    return [...filterOptionsWithItemsRemoved, ...filterOptionsToAdd];
  }, [filterOptions, records, tableFields]);
};
