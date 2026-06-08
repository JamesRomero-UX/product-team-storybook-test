import type { CollectionPreferencesProps } from '@risk-smart/themed-cloudscape-components/collection-preferences';
import type { TableProps } from '@risk-smart/themed-cloudscape-components/table';
import Table from '@risksmart-app/components/src/table';
import type {
  GetFormCustomisationQuery,
  GetReportingDataQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, type ReactNode } from 'react';
import { useFeatures } from 'src/rbac/useFeatures';

import type { TypedCustomDatasource } from '../types';
import { useCustomDatasourceHelpers } from '../useCustomDatasourceHelpers';
import CustomDatasourceCollectionPreferences from './CustomDatasourceCollectionPreferences';
import { CustomDatasourceModel } from './customDatasourceModel';
import { displayTypes } from './display-types';
import Pager from './Pager';
import type { CustomAttributeSchemaLookup } from './types';

export type Props = {
  variant?: TableProps.Variant;
  customDatasource: Pick<TypedCustomDatasource, 'Datasources' | 'Fields'>;
  items: GetReportingDataQuery['reportingData'];
  onPageChangeClick?: (e: { requestedPageIndex: number }) => void;
  currentPageIndex: number;
  pageSize: number;
  loading: boolean;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null;
  filter?: ReactNode;
  /**
   * Set to false to disable ability to hide table columns in preferences
   */
  columnsAlwaysVisible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences?: CollectionPreferencesProps.Preferences<any>;
  onSetPreferences: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    preferences: CollectionPreferencesProps.Preferences<any>
  ) => void;
};

const CustomDatasourceTable: FC<Props> = ({
  customDatasource,
  columnsAlwaysVisible,
  items,
  onPageChangeClick,
  currentPageIndex,
  pageSize,
  loading,
  customAttributeSchemaLookup,
  formFieldConfigurations,
  variant,
  filter,
  preferences,
  onSetPreferences,
}) => {
  const enabledFeatures = useFeatures();
  const helpers = useCustomDatasourceHelpers();
  const customDatasourceModel = CustomDatasourceModel(
    customDatasource,
    customAttributeSchemaLookup,
    formFieldConfigurations,
    enabledFeatures
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columnDefinitions: readonly TableProps.ColumnDefinition<any>[] =
    customDatasourceModel.fields.map((field, index) => {
      return {
        id: field.value,
        header: field?.label ?? field?.defaultLabel,
        cell: (item) => {
          const fieldDef = field;
          if (!fieldDef) {
            throw new Error('Missing field def');
          }

          return displayTypes[fieldDef.displayType].cell({
            fieldDef,
            fieldData: item[index],
            helpers,
          });
        },
      };
    }) ?? [];

  return (
    <Table
      preferences={
        <CustomDatasourceCollectionPreferences
          columnsAlwaysVisible={columnsAlwaysVisible}
          fields={customDatasourceModel.fields}
          preferences={preferences}
          onConfirm={(e) => {
            onSetPreferences(e.detail);
          }}
        />
      }
      columnDisplay={preferences?.contentDisplay}
      filter={filter}
      loading={loading}
      variant={variant}
      pagination={
        onPageChangeClick && (
          <Pager
            loading={loading}
            currentPageIndex={currentPageIndex}
            pageSize={pageSize}
            currentPageSize={items?.length ?? 0}
            onPageChangeClick={onPageChangeClick}
          />
        )
      }
      items={items ?? []}
      columnDefinitions={columnDefinitions}
      empty={'No records found'}
    />
  );
};

export default CustomDatasourceTable;
