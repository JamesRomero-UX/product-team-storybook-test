import type { OrgFeature } from '@risksmart-app/modules/src/index';
import { getSharedDatasets } from '@risksmart-app/shared/reporting/datasets';
import { aggregateTypeSupportedDataTypes } from '@risksmart-app/shared/reporting/dataTypes';
import type { AggregateType } from '@risksmart-app/shared/reporting/schema';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';

import type { TypedCustomDatasource } from '../types';
import type { TreeDataSource } from './customDatasourceSchema';
import type { FieldDefinitionWithId } from './datasetModel';
import { DatasetModel } from './datasetModel';
import { getFlattenedDataSources } from './datasourceTreeMapping';
import { getFieldFromUniqueId, getFieldUniqueId } from './fieldValue';
import type { CustomAttributeSchemaLookup, RelatedDataSource } from './types';

export type FieldDefinitionWithDataSourceIndex = FieldDefinitionWithId & {
  dataSourceIndex: number;
  /**
   * combination of dataSourceIndex and value to create a unique field
   */
  value: string;

  defaultNestedLabel: string;

  defaultLabel: string;
};

/**
 * An adapter to use CustomDatasourceModel with tree based data sources
 * @param root
 * @param customAttributeSchemaLookup
 * @returns
 */
export const TreeCustomDatasourceModel = (
  root: TreeDataSource,
  customAttributeSchemaLookup: CustomAttributeSchemaLookup,
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null,
  enabledFeatures: OrgFeature[]
) => {
  const dataSources = getFlattenedDataSources(root);
  const fields = dataSources.flatMap((d, dataSourceIndex) =>
    d.fields.map((f) => ({ ...f, dataSourceIndex }))
  );

  return CustomDatasourceModel(
    { Datasources: dataSources, Fields: fields },
    customAttributeSchemaLookup,
    formFieldConfigurations,
    enabledFeatures
  );
};

export const CustomDatasourceModel = (
  {
    Datasources,
    Fields,
  }: Pick<TypedCustomDatasource, 'Datasources' | 'Fields'>,
  customAttributeSchemaLookup: CustomAttributeSchemaLookup,
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null,
  enabledFeatures: OrgFeature[]
) => {
  const datasetModels = Datasources.map((ds) =>
    DatasetModel(
      ds.type,
      customAttributeSchemaLookup,
      formFieldConfigurations,
      !_.isNil(ds.parentIndex),
      enabledFeatures
    )
  );
  const allFields: FieldDefinitionWithDataSourceIndex[] = datasetModels.flatMap(
    (dm, dataSourceIndex) =>
      dm.fields.map((f) => {
        const selectedField = Fields?.find(
          (sf) =>
            sf.dataSourceIndex == dataSourceIndex && sf.fieldId == f.fieldId
        );

        return {
          ...f,
          dataSourceIndex,
          value: getFieldUniqueId({ dataSourceIndex, fieldId: f.fieldId }),
          defaultLabel: f.defaultLabel,
          defaultNestedLabel: getNestedLabel(
            dataSourceIndex,
            Datasources,
            f.defaultLabel
          ),
          label: selectedField?.label as string,
        };
      })
  );

  const fields: FieldDefinitionWithDataSourceIndex[] = (Fields ?? []).map(
    (df) => {
      const matchedField = allFields.find(
        (f) =>
          df.dataSourceIndex === f.dataSourceIndex && df.fieldId == f.fieldId
      )!;

      return matchedField;
    }
  );

  const getField = (dataSourceIndex: number, fieldId: string) => {
    const fieldDef = allFields.find(
      (f) => f.dataSourceIndex == dataSourceIndex && f.fieldId == fieldId
    );

    if (!fieldDef) {
      throw new Error(`Field not found for ${dataSourceIndex} ${fieldId}`);
    }

    return fieldDef;
  };

  return {
    /**
     * The custom datasources chosen fields
     */
    fields,
    /**
     * All fields that are available to create a custom data source based on the chosen data sources
     */
    allFields,
    getField,
    getFieldByUniqueId: (uniqueId: string) => {
      const field = getFieldFromUniqueId(uniqueId);

      return getField(field.dataSourceIndex, field.fieldId);
    },
    getChartYFields: (aggregationType: AggregateType) => {
      return (
        fields.filter((f) => {
          return aggregateTypeSupportedDataTypes[aggregationType].includes(
            f.dataType
          );
        }) ?? []
      ).map((f) => ({
        label: f.label ?? f.defaultLabel,
        value: f.value,
      }));
    },
  };
};

/**
 * Returns a label that is prefixed with the data source names
 * @param label
 * @returns
 */
const getNestedLabel = (
  dataSourceIndex: number,
  dataSources: RelatedDataSource[],
  label: string
) => {
  let parentDataSource: null | RelatedDataSource = dataSources[dataSourceIndex];
  const sharedDatasets = getSharedDatasets();
  while (parentDataSource) {
    const parentDs = sharedDatasets[parentDataSource.type];
    label = `${parentDs.label} / ${label}`;
    if (parentDataSource.parentIndex !== undefined) {
      parentDataSource = dataSources[parentDataSource.parentIndex];
    } else {
      parentDataSource = null;
    }
  }

  return label;
};
