import type {
  PropertyFilterProperty,
  PropertyFilterQuery,
  UseCollectionResult,
} from '@cloudscape-design/collection-hooks';
import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { isEqual } from 'lodash';
import { useMemo, useState } from 'react';

import { useExportToCsv } from '@/utils/table/hooks/useExportToCsv';
import type { TableFields } from '@/utils/table/types';
import {
  emptyFilterQuery,
  type TablePreferences,
  type TablePropsWithActions,
  type TableRecord,
} from '@/utils/table/types';

type CombinedTableProps<T extends TableRecord> = {
  allItems: readonly T[] | undefined;
  filteringProperties: readonly PropertyFilterProperty<unknown>[];
  actions: Pick<UseCollectionResult<T>['actions'], 'setPropertyFiltering'>;
  propertyFilterProps: Pick<PropertyFilterProps, 'filteringOptions'>;
  propertyFilterQuery: PropertyFilterQuery;
  exportToCsvString: () => string;
  exportToCsv: () => void;
  // Export combined data for external PDF functionality
  combinedFields: TableFields<T>;
  combinedPreferences: TablePreferences<T>;
};

const unsetToken = {
  value: 'unset',
  propertyKey: 'unset',
  operator: 'unset',
} as const;

const unsetFilterQuery = {
  tokens: [unsetToken],
  operation: 'and',
  tokenGroups: [],
} as const;

export const useCombineTableProps = <
  T1 extends TableRecord,
  T2 extends TableRecord,
>(
  primaryTable: Pick<
    TablePropsWithActions<T1>,
    | 'actions'
    | 'allItems'
    | 'fields'
    | 'filteringProperties'
    | 'preferenceDetails'
    | 'propertyFilterProps'
    | 'propertyFilterQuery'
  >,
  secondaryTable: Pick<
    TablePropsWithActions<T2>,
    | 'actions'
    | 'allItems'
    | 'fields'
    | 'filteringProperties'
    | 'preferenceDetails'
    | 'propertyFilterProps'
    | 'propertyFilterQuery'
  >,
  formConfigurations: FormConfigurationPartsFragment[] | null = null
): CombinedTableProps<T1 | T2> => {
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilterQuery>();

  useMemo(() => {
    if (
      isEqual(
        primaryTable.propertyFilterQuery,
        secondaryTable.propertyFilterQuery
      )
    ) {
      setPropertyFilter(primaryTable.propertyFilterQuery);
    } else {
      setPropertyFilter(unsetFilterQuery);
    }
  }, [primaryTable.propertyFilterQuery, secondaryTable.propertyFilterQuery]);

  const combinedPropertyFiltering = (query: PropertyFilterQuery) => {
    primaryTable.actions.setPropertyFiltering(query);
    secondaryTable.actions.setPropertyFiltering(query);
  };

  const combinedFields = {
    ...(primaryTable.fields ?? {}),
    ...(secondaryTable.fields ?? {}),
  } as TableFields<T1 | T2>;

  const combinedContentDisplayPreferences =
    primaryTable.preferenceDetails.preferences.contentDisplay &&
    secondaryTable.preferenceDetails.preferences.contentDisplay
      ? Array.from(
          new Set([
            ...primaryTable.preferenceDetails.preferences.contentDisplay
              .filter((c) => c.visible)
              .map((c) => c.id),
            ...secondaryTable.preferenceDetails.preferences.contentDisplay
              .filter((c) => c.visible)
              .map((c) => c.id),
          ])
        )
      : undefined;

  const combinedItems =
    primaryTable.allItems && secondaryTable.allItems
      ? [...primaryTable.allItems, ...secondaryTable.allItems]
      : undefined;

  const combinedPreferences = {
    contentDisplay: combinedContentDisplayPreferences?.map((id) => ({
      id,
      visible: true,
    })),
  };

  const { exportToCsvString, exportToCsv } = useExportToCsv({
    tableFields: combinedFields,
    allPageItems: combinedItems ?? [],
    preferences: combinedPreferences as TablePreferences<T1 | T2>,
    entityLabel: 'combined-export',
    labelFormConfigurations: formConfigurations,
  });

  const combinedProps = {
    allItems: combinedItems,
    filteringProperties: [
      ...primaryTable.filteringProperties,
      ...secondaryTable.filteringProperties,
    ],
    actions: { setPropertyFiltering: combinedPropertyFiltering },
    propertyFilterProps: {
      filteringOptions:
        primaryTable.propertyFilterProps.filteringOptions &&
        secondaryTable.propertyFilterProps.filteringOptions
          ? [
              ...primaryTable.propertyFilterProps.filteringOptions,
              ...secondaryTable.propertyFilterProps.filteringOptions,
            ]
          : undefined,
    },
    propertyFilterQuery: propertyFilter ?? emptyFilterQuery,
    exportToCsvString,
    exportToCsv,
    // Export combined data for external PDF functionality
    combinedFields,
    combinedPreferences: combinedPreferences as TablePreferences<T1 | T2>,
  };

  return combinedProps;
};
