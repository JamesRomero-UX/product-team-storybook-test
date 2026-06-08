import type { CustomDatasourceField } from '@risksmart-app/web-graphql-client/generated/graphql';

/**
 * Give a field value dataSource|fieldId, returns a object with data source index and field id as fields
 * @param value
 * @returns
 */
export const getFieldFromUniqueId = (value: string) => {
  const [dataSourceIndex, fieldId] = value?.split('|') ?? ['0', ''];

  return {
    dataSourceIndex: parseInt(dataSourceIndex),
    fieldId,
  };
};
export const getFieldUniqueId = ({
  dataSourceIndex,
  fieldId,
}: CustomDatasourceField) => `${dataSourceIndex}|${fieldId}`;
