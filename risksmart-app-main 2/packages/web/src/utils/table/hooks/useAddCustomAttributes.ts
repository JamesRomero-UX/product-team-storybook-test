import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';

import type { Dataset, TableFields, TableRecord } from '../types';
import { useAddCustomAttributeFieldData } from './useAddCustomAttributeFieldData';
import { useAddCustomAttributeFieldDefinitions } from './useAddCustomAttributeFieldDefinitions';

type Options<T extends TableRecord> = {
  customAttributeSchema: CustomAttributeSchema | CustomAttributeSchema[] | null;
  fields: TableFields<T>;
  data: Dataset<T> | undefined;
  useRelativeDates: boolean;
};

/**
 * Adds custom attribute support by modifying the dataset and field definitions
 *
 * @param options
 * @returns
 */
export const useAddCustomAttributes = <T extends TableRecord>(
  options: Options<T>
) => {
  const tableFields = useAddCustomAttributeFieldDefinitions({
    fields: options.fields,
    customAttributeSchema: options.customAttributeSchema,
    enableRelativeDates: options.useRelativeDates,
  });
  const tableData = useAddCustomAttributeFieldData({
    data: options.data,
    tableFields,
  });

  return { tableFields, tableData };
};
