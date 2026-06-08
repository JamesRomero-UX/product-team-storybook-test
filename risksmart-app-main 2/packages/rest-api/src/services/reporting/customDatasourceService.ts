import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import { init } from '@risksmart-app/i18n/src/i18n';
import type {
  DataSourceField,
  DataSourceRequest,
  GroupBy,
} from '@risksmart-app/shared/reporting/api/schema';
import { getSharedDatasets } from '@risksmart-app/shared/reporting/datasets';
import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import type { ParentTypeEnum, ReportField } from 'generated/graphql';
import type { DB } from 'generated-db/db';
import { BadRequest } from 'http-errors';
import _ from 'lodash';

import { customAttributeQueryInfo } from './custom-attribute-fields';
import { getDataSets } from './datasets';
import type {
  CustomAttributeFieldDefType,
  FieldInfo,
  LazyTables,
  TableNames,
} from './datasets/types';
import { inlineArrayJoinFieldsTypes } from './lateral-join-array-field-types';
import type { BaseColumn } from './sql-query-models/columns/BaseColumn';
import { CustomAttributeColumn } from './sql-query-models/columns/CustomAttributeColumn';
import { CustomAttributeInlinedArrayColumn } from './sql-query-models/columns/CustomAttributeInlinedArrayColumn';
import { CustomAttributeInlinedArrayJoinedColumn } from './sql-query-models/columns/CustomAttributeInlinedArrayJoinedColumn';
import { CustomAttributeJoinedColumn } from './sql-query-models/columns/CustomAttributeJoinedColumn';
import { InlinedArrayJoinedColumn } from './sql-query-models/columns/InlinedArrayJoinedColumn';
import { InlinedArrayJoinedFunctionColumn } from './sql-query-models/columns/InlinedArrayJoinedFunctionColumn';
import { JoinedColumn } from './sql-query-models/columns/JoinedColumn';
import { JoinedColumnWithMeta } from './sql-query-models/columns/JoinedColumnWithMeta';
import { JunctionTableColumn } from './sql-query-models/columns/JunctionTableColumn';
import { StandardColumn } from './sql-query-models/columns/StandardColumn';
import { assertValidCustomAttributeName } from './sqlQueryHelpers';
import type { CustomAttributeSchemaLookup } from './types';

interface Options {
  fields?: DataSourceField[] | null /**
   * The field to group on
   */;
  groupBy?: GroupBy[] | null;
  dataSources: DataSourceRequest[] /**
   * A lookup of custom attribute schemas. Required for validation when querying custom attributes
   */;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
}
const customAttributeFieldIdPrefix = 'custom/';

export const CustomDatasourceService = async (options: Options) => {
  // Need to use initializeWithCustomerTaxonomy if we want custom translations on backend (which we currently don't need)
  await init();
  // Combine these two into one in the near feature!
  const sharedDatasets = getSharedDatasets();
  const datasets = getDataSets();

  const getCustomFieldId = (field: DataSourceField) =>
    field.fieldId.replace(customAttributeFieldIdPrefix, '');

  /**
   * Assert custom attribute exists on custom attribute schema
   * @param customAttributeFormConfigurationParentType
   * @param field
   */
  const assertCustomAttributeFieldExistsOnSchema = (
    customAttributeFormConfigurationParentTypes: ParentTypeEnum[] | undefined,
    field: DataSourceField
  ) => {
    const { customAttributeSchemaLookup } = options;
    if (
      !customAttributeFormConfigurationParentTypes ||
      customAttributeFormConfigurationParentTypes.length === 0
    ) {
      throw new Error(
        'Custom attribute requested on dataset that does not support custom attributes'
      );
    }
    let attributeFound = false;
    const customFieldId = getCustomFieldId(field);
    for (const customAttributeFormConfigurationParentType of customAttributeFormConfigurationParentTypes) {
      const customAttributeSchema =
        customAttributeSchemaLookup[customAttributeFormConfigurationParentType];

      const customAttribute =
        customAttributeSchema?.properties?.[customFieldId];
      if (customAttribute) {
        attributeFound = true;
      }
    }
    if (!attributeFound) {
      throw new Error(
        `Custom attribute definition not found for ${customFieldId}`
      );
    }
  };

  /**
   * Retrieve dataset field definition
   * @param datasources
   * @param field
   * @returns
   */
  const getFieldDefinition = (field: DataSourceField) => {
    const datasource = getDatasourceByIndex(field.dataSourceIndex);
    const datasetDef = getDatasetByType(datasource);

    if (!field.fieldId.startsWith(customAttributeFieldIdPrefix)) {
      const fieldDefinition: FieldInfo<
        keyof DB,
        LazyTables<keyof DB>,
        keyof DB
      > = datasetDef.fields[
        field.fieldId as keyof typeof datasetDef.fields
      ] as FieldInfo<keyof DB, LazyTables<keyof DB>, keyof DB>;
      if (!fieldDefinition) {
        throw new BadRequest(
          `Field "${field.fieldId}" does not exist on datasource "${datasource.type}"`
        );
      }
      const shareDatasetField =
        sharedDatasets[datasource.type].fields[field.fieldId];
      if (!shareDatasetField) {
        throw new Error(
          `Cannot find field ${field.fieldId} on data source ${datasource.type}`
        );
      }

      return {
        ...fieldDefinition,
        dataType: shareDatasetField.dataType,
      };
    } else {
      const customFieldId = getCustomFieldId(field);
      assertCustomAttributeFieldExistsOnSchema(
        datasetDef.customAttributeFormConfigurationParentTypes,
        field
      );
      assertValidCustomAttributeName(customFieldId);
      const typeStr = customFieldId.split('_')[1];
      if (
        !Object.values(CustomAttributeFieldType).includes(
          typeStr as CustomAttributeFieldType
        )
      ) {
        throw new Error(`Invalid custom attribute type: ${typeStr}`);
      }
      const customAttributeType = typeStr as CustomAttributeFieldType;

      const customAttributeFieldType: CustomAttributeFieldDefType = {
        fieldType: 'customAttribute',
        customAttribute: customFieldId,
        customAttributeType,
      };

      return { ...customAttributeFieldType, dataType: 'text' };
    }
  };

  /**
   * Little helper to retrieve the datasource from the request by index
   * @param dataSourceIndex
   * @returns
   */
  const getDatasourceByIndex = (dataSourceIndex: number): DataSourceRequest => {
    const { dataSources } = options;
    const datasource = dataSources[dataSourceIndex];
    if (!datasource) {
      throw new BadRequest(
        `Datasource at index ${dataSourceIndex} which does not exist`
      );
    }

    return datasource;
  };

  /**
   * Helper to retrieve a dataset by its type
   * @param type
   * @returns
   */
  const getDatasetByType = (datasourceRequest: DataSourceRequest) => {
    let leftDatasetType: DataSourceType | null = null;
    if (!_.isNil(datasourceRequest.parentIndex)) {
      leftDatasetType = getDatasourceByIndex(
        datasourceRequest.parentIndex
      ).type;
    }

    const { type, latest } = datasourceRequest;
    const datasetGetter = datasets[type];
    if (!datasetGetter) {
      throw new BadRequest(`Datasource not found for "${type}"`);
    }

    const datasetDef = datasetGetter(!!latest, leftDatasetType);
    if (latest) {
      if (!datasetDef.supportedLatest) {
        throw new BadRequest(
          `Dataset "${type}" does not support latest records`
        );
      }
      if (
        _.isNil(datasourceRequest.parentIndex) ||
        (datasourceRequest.relationshipToParentIndex ?? 'child') !== 'child'
      ) {
        throw new BadRequest(`Cannot query latest ${type} without a parent`);
      }
    }

    return datasetDef;
  };

  const getDatasetByIndex = (dataSourceIndex: number) => {
    const dataSource = getDatasourceByIndex(dataSourceIndex);

    return getDatasetByType(dataSource);
  };

  /**
   *  Format response from the generated sql into that required by the front end.
   * Note: these is NOT a 1-1 mapping between columns on sql result set, and that
   * of the front end, as some reporting columns consist of multiple result set columns (for metadata such as sorting and colour)
   * @param results
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatQueryResultsToTable = (results: any[][]): ReportField[][] => {
    const { fields, groupBy } = options;
    const reportFields = [
      ...(fields ?? []),
      ...(groupBy?.map((g) => g.field) ?? []),
    ];

    const fieldDefinitions = reportFields.map((field) => {
      const fieldDef = getFieldDefinition(field);
      const hasMetaColumns =
        fieldDef.fieldType === 'lazyJoinedColumn' && fieldDef.metaPgColumns;
      const metaColumnKeys = hasMetaColumns
        ? Object.keys(fieldDef.metaPgColumns!)
        : [];
      const hasSourceMetaColumns =
        fieldDef.fieldType === 'lazyJoinedColumn' &&
        fieldDef.sourceMetaPgColumns;
      const sourceMetaColumnKeys = hasSourceMetaColumns
        ? Object.keys(fieldDef.sourceMetaPgColumns!)
        : [];

      return {
        hasMetaColumns: hasMetaColumns || hasSourceMetaColumns,
        metaColumnKeys: [...metaColumnKeys, ...sourceMetaColumnKeys],
      };
    });

    return results.map((record) => {
      const formattedRecord: ReportField[] = [];
      let recordIndex = 0;

      for (const { hasMetaColumns, metaColumnKeys } of fieldDefinitions) {
        const value = record[recordIndex];
        recordIndex++;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta: Record<string, any> = {};

        if (hasMetaColumns) {
          for (const col of metaColumnKeys) {
            meta[col] = record[recordIndex];
            recordIndex++;
          }
        }

        formattedRecord.push({ value, meta });
      }

      while (recordIndex < record.length) {
        formattedRecord.push({
          value: record[recordIndex],
          meta: {},
        });
        recordIndex++;
      }

      return formattedRecord;
    });
  };

  /**
   * Given the data source field, returns a Column object that can handles differences in the way columns need to be rendered
   * @param dataSourceField
   * @param fieldInfo
   * @returns
   */
  const getQueryColumn = <
    Table extends TableNames,
    ParentJoinTable extends TableNames,
  >(
    dataSourceField: DataSourceField
  ): BaseColumn => {
    const dataSource = getDatasetByIndex(dataSourceField.dataSourceIndex);
    // Eventually would like to simplify this to combine getQueryColumn with getFieldDefinition
    const fieldInfo = getFieldDefinition(dataSourceField);
    const fieldType = fieldInfo.fieldType;
    switch (fieldType) {
      case 'column':
        if (fieldInfo.isFromJoinTable) {
          return new JunctionTableColumn<ParentJoinTable>(dataSourceField, {
            pgColumn: fieldInfo.pgColumn,
          });
        } else {
          return new StandardColumn<Table>(dataSourceField, {
            pgColumn: fieldInfo.pgColumn,
          });
        }

      case 'customAttribute': {
        if (fieldInfo.customAttributeType === 'multiselect') {
          return new CustomAttributeInlinedArrayColumn(dataSourceField, {
            customAttribute: fieldInfo.customAttribute,
            customAttributeType: fieldInfo.customAttributeType,
          });
        }
        const customAttributeQuery =
          customAttributeQueryInfo[fieldInfo.customAttributeType];
        if (customAttributeQuery) {
          if ('pgLabelColumn' in customAttributeQuery) {
            if (customAttributeQuery.isArray) {
              return new CustomAttributeInlinedArrayJoinedColumn(
                dataSourceField,
                {
                  customAttribute: fieldInfo.customAttribute,
                  pgLabelColumn: customAttributeQuery.pgLabelColumn,
                  customAttributeType: fieldInfo.customAttributeType,
                }
              );
            }

            return new CustomAttributeJoinedColumn(dataSourceField, {
              customAttribute: fieldInfo.customAttribute,
              pgLabelColumn: customAttributeQuery.pgLabelColumn,
              customAttributeType: fieldInfo.customAttributeType,
            });
          }
        }

        return new CustomAttributeColumn(dataSourceField, {
          customAttribute: fieldInfo.customAttribute,
          customAttributeType: fieldInfo.customAttributeType,
        });
      }
      case 'inlineArrayJoin': {
        const joinInfo = inlineArrayJoinFieldsTypes[fieldInfo.type];
        // Use idColumn override if specified, otherwise use dataset PK
        const idColumn = fieldInfo.idColumn ?? dataSource.pk;
        if ('objectTableQueryCol' in joinInfo) {
          return new InlinedArrayJoinedColumn(dataSourceField, {
            type: fieldInfo.type,
            datasourcePkPgColumn: idColumn,
          });
        } else {
          return new InlinedArrayJoinedFunctionColumn(dataSourceField, {
            type: fieldInfo.type,
            datasourcePkPgColumn: idColumn,
          });
        }
      }
      case 'lazyJoinedColumn':
        if (fieldInfo.metaPgColumns) {
          return new JoinedColumnWithMeta<Table>(dataSourceField, {
            pgColumn: fieldInfo.pgColumn,
            metaPgColumns: fieldInfo.metaPgColumns,
            sourceMetaPgColumns: fieldInfo.sourceMetaPgColumns,
            tableRef: fieldInfo.tableRef,
            relations: dataSource.relations as LazyTables<Table>,
          });
        }

        return new JoinedColumn(dataSourceField, {
          pgColumn: fieldInfo.pgColumn,
          tableRef: fieldInfo.tableRef,
          relations: dataSource.relations as LazyTables<Table>,
        });

      default:
        throw new Error(`Unsupported field type: ${fieldType}`);
    }
  };

  return {
    formatQueryResultsToTable,
    getDatasourceByIndex,
    getFieldDefinition,
    getDatasetByType,
    getDatasetByIndex,
    getQueryColumn,
  };
};
