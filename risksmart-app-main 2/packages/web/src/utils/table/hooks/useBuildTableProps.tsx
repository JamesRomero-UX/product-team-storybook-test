import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import type { PaginationProps } from '@risk-smart/themed-cloudscape-components/pagination';
import Pagination from '@risk-smart/themed-cloudscape-components/pagination';
import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import type { TableProps } from '@risk-smart/themed-cloudscape-components/table';
import { defaultPropertyFilterI18nStrings } from '@risksmart-app/components/src/table/propertyFilterI18nStrings';
import i18next from '@risksmart-app/i18n/src/i18n';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ParseKeys } from 'i18next';
import type { ReactNode } from 'react';
import PropertyFilterPanel from 'src/components/property-filter-panel';

import { labelWithPlural } from '@/utils/utils';

import CollectionPreferences from '../components/CollectionPreferences';
import TableFooter from '../components/TableFooter';
import type {
  CollectionActions,
  TableFields,
  TablePreferences,
  TablePropsWithActions,
  TableRecord,
  TableRecordColumnWidths,
} from '../types';
import { useExportToCsv } from './useExportToCsv';

type UseBuildTablePropsConfig<T extends TableRecord> = {
  tableFields: TableFields<T>;
  allPageItems: readonly (T & unknown)[];
  // TODO: Got a max of ParseKeys and string usage and the translation keys are working correctly. Need a better solution
  entityLabel: ParseKeys<'common'> | string;
  columnDefinitions: TableProps.ColumnDefinition<T>[];
  items: readonly (T & unknown)[];
  allItems: readonly (T & unknown)[];
  filtersEnabled: boolean;
  propertyFilterProps: PropertyFilterProps;
  paginationProps: PaginationProps;
  actions: CollectionActions<T>;
  preferences: TablePreferences<T>;
  setPreferences: (preferences: TablePreferences<T>) => void;
  onSortingChange: (sortingState: TableProps.SortingState<T>) => void;
  onPropertyFilterChange: (query: PropertyFilterQuery) => void;
  extraFilters?: ReactNode;
  extraProps: Partial<TablePropsWithActions<T>>;
  labelFormConfigurations: FormConfigurationPartsFragment[] | null;
};

export const useBuildTableProps = <T extends TableRecord>({
  tableFields,
  allPageItems,
  preferences,
  entityLabel,
  columnDefinitions,
  items,
  allItems,
  propertyFilterProps,
  filtersEnabled,
  paginationProps,
  actions,
  setPreferences,
  onSortingChange,
  onPropertyFilterChange,
  extraProps,
  extraFilters,
  labelFormConfigurations,
}: UseBuildTablePropsConfig<T>): TablePropsWithActions<T> => {
  const { exportToCsvString, exportToCsv } = useExportToCsv({
    tableFields,
    allPageItems,
    preferences,
    entityLabel,
    labelFormConfigurations,
  });

  const props: TablePropsWithActions<T> = {
    ...extraProps,
    propertyFilterProps,
    exportToCsvString,
    exportToCsv,
    fields: tableFields,
    labelFormConfigurations,
    items,
    columnDefinitions,
    visibleColumns: preferences?.visibleContent,
    filter: filtersEnabled && (
      <div className={'flex flex-row gap-3'}>
        <PropertyFilterPanel
          i18nStrings={{
            ...defaultPropertyFilterI18nStrings,
            filteringPlaceholder: i18next.t(
              propertyFilterProps.disableFreeTextFiltering
                ? 'tables.filtering_placeholder'
                : 'tables.filtering_placeholder_free_text',
              {
                entity: labelWithPlural(entityLabel).plural,
              }
            ),
          }}
          expandToViewport={true}
          virtualScroll={true}
          {...propertyFilterProps}
        />
        {extraFilters}
      </div>
    ),
    preferences: (
      <CollectionPreferences
        preferences={preferences}
        setPreferences={setPreferences}
        fields={tableFields}
        entityLabel={entityLabel}
        formConfigurations={labelFormConfigurations}
      />
    ),
    onSortingChange: (e) => onSortingChange(e.detail),
    pagination: <Pagination {...paginationProps} />,
    actions: {
      ...actions,
      setPropertyFiltering: onPropertyFilterChange,
    },
    propertyFilterQuery: propertyFilterProps.query,
    resizableColumns: true,
    sortingDisabled: false,
    loadingText: i18next.t('tables.loading_message', {
      entity: labelWithPlural(entityLabel).plural,
    }),
    filteringProperties: propertyFilterProps.filteringProperties,
    allItems: allItems,
    stickyColumns: preferences?.stickyColumns,
    wrapLines: preferences?.wrapLines,
    stripedRows: preferences?.stripedRows,
    columnDisplay: preferences?.contentDisplay,
    contentDensity: preferences?.contentDensity,
    footer: (
      <TableFooter
        tableFields={tableFields}
        items={items}
        tablePreferences={preferences}
        formConfigurations={labelFormConfigurations}
      />
    ),
    onColumnWidthsChange: (e) => {
      setPreferences({
        ...preferences,
        custom: {
          columnWidths: Object.keys(tableFields).reduce(
            (previous, current, i) => {
              return {
                ...previous,
                [current]: e.detail.widths[i],
              };
            },
            {} as TableRecordColumnWidths<T>
          ),
        },
      });
    },
    preferenceDetails: {
      preferences,
      setPreferences,
    },
  };

  return props;
};
