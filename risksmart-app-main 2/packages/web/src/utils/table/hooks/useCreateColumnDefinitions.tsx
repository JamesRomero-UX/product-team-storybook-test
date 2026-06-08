import type { TableProps } from '@risk-smart/themed-cloudscape-components/table';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { MAX_COL_WIDTH } from 'src/App.config';
import useEntityInfo from 'src/hooks/getEntityInfo';

import { EMPTY_CELL } from '../../collectionUtils';
import type { TableRecord, TableRecordColumnWidths } from '../types';
import { useFormConfigRegistry } from './form/useFormConfigRegistry';
import { getColumnHeader } from './getColumnHeader';
import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';

type Options<T extends TableRecord> = {
  tableFields: TableFieldsWithCustomAttributes<T>;
  columnWidths?: TableRecordColumnWidths<T>;
  labelFormConfigurations: FormConfigurationPartsFragment[] | null;
};

/**
 * Creates cloudscape compatible table column definitions based on RiskSmarts
 * definitions, as well as ensuring column widths are appropriately set. Why
 * does Risksmart have a different format for field definitions? this was
 * implemented in an attempt to reduce duplications, and mistakes between column
 * definitions, filter definitions and table preferences
 *
 * @param param0
 * @returns
 */
export const useCreateColumnDefinitions = <T extends TableRecord>({
  tableFields,
  columnWidths,
  labelFormConfigurations,
}: Options<T>): TableProps.ColumnDefinition<T>[] => {
  const formRegistry = useFormConfigRegistry();
  const getEntityInfo = useEntityInfo();

  return useMemo((): TableProps.ColumnDefinition<T>[] => {
    return Object.entries(tableFields).map(([fieldName, fieldConfig]) => {
      const { filterOptions: _filterOptions, ...field } = fieldConfig;
      const header = getColumnHeader(
        {
          formConfigurations: labelFormConfigurations,
          formRegistry,
          getEntityInfo,
        },
        fieldConfig
      );

      return {
        ...field,
        header,
        id: fieldName,
        width: columnWidths?.[fieldName],
        maxWidth: field.maxWidth ?? MAX_COL_WIDTH,
        sortingField: !field.sortingDisabled
          ? (field.sortingField ?? fieldName)
          : undefined,
        cell:
          field.cell ??
          ((item) => <>{(item[fieldName] as string) ?? EMPTY_CELL}</>),
      };
    });
  }, [
    columnWidths,
    tableFields,
    formRegistry,
    getEntityInfo,
    labelFormConfigurations,
  ]);
};
