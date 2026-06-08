import type {
  DataSourceField,
  DataSourceRequest,
  FilterGroup,
  GroupBy,
} from '@risksmart-app/shared/reporting/api/schema';
import type {
  AggregateType,
  DataSourceType,
} from '@risksmart-app/shared/reporting/schema';
import { FormConfigurationRepository } from 'src/repositories/form-configuration/formConfiguration.repository';
import type { SessionData } from 'src/session';

import { query } from './databaseClient';
import { getReportDataSql } from './sqlQueryBuilder';
import type { CustomAttributeSchemaLookup } from './types';

/**
 * Return a list of filter option suggested for the given text
 */
export const getFilterOptionSuggestions = async ({
  orgKey,
  filteringText,
  dataSourceType,
  fieldId,
  limit,
  offset,
  customAttributeSchemaLookup,
}: {
  orgKey: string;
  filteringText: string;
  dataSourceType: DataSourceType;
  fieldId: string;
  limit: number;
  offset: number;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
}) => {
  const field: DataSourceField = { fieldId, dataSourceIndex: 0 };

  return getReportData({
    unnestInlineArrays: true,
    orgKey,
    dataSources: [
      {
        type: dataSourceType,
      },
    ],
    limit,
    offset,
    filters: {
      operation: 'and',
      filters: [
        {
          operation: 'and',
          filters: [
            {
              operator: ':',
              value: filteringText,
              field,
            },
          ],
        },
      ],
    },
    fields: [field],
    customAttributeSchemaLookup,
    distinct: true,
  });
};

/**
 * Query reporting data
 * @param param0
 * @returns
 */
export const getReportData = async ({
  orgKey,
  dataSources,
  groupBy,
  fields,
  filters,
  limit,
  offset,
  customAttributeSchemaLookup,
  distinct,
  aggregateField,
  aggregateType,
  unnestInlineArrays,
}: {
  orgKey: string;
  dataSources: DataSourceRequest[];
  fields: DataSourceField[];
  aggregateField?: DataSourceField | null;
  aggregateType?: AggregateType | null;
  filters: FilterGroup;
  groupBy?: GroupBy[] | null;
  unnestInlineArrays?: boolean;

  /**
   * Retrieve only unique rows
   */
  distinct?: boolean;
  limit: number;
  offset: number /**
   * A lookup of custom attribute schemas. Required for validation when querying custom attributes
   */;
  customAttributeSchemaLookup: CustomAttributeSchemaLookup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any[][]> => {
  const sqlQuery = await getReportDataSql({
    unnestInlineArrays,
    dataSources,
    fields,
    filters,
    limit,
    offset,
    customAttributeSchemaLookup,
    distinct,
    groupBy,
    aggregateField,
    aggregateType,
  });

  return query(
    async (client) => {
      const result = await client.query({
        text: sqlQuery.sql,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        values: sqlQuery.parameters as any[],
        rowMode: 'array',
      });

      return result.rows;
    },
    { orgKey }
  );
};
export const getCustomAttributeSchemaLookup = async (
  sessionData: SessionData
): Promise<CustomAttributeSchemaLookup> => {
  const formConfigurationRepository = FormConfigurationRepository(sessionData);
  const { form_configuration: formConfigurations } =
    await formConfigurationRepository.findWhere({});

  const customAttributeSchemaLookup: CustomAttributeSchemaLookup = {};
  for (const formConfiguration of formConfigurations) {
    if (formConfiguration.customAttributeSchema) {
      customAttributeSchemaLookup[formConfiguration.ParentType] =
        formConfiguration.customAttributeSchema.Schema;
    }
  }

  return customAttributeSchemaLookup;
};
