import { useMemo } from 'react';
import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';

import type { TableFields, TableRecord } from '../types';
import { convertSchemasToFieldConfigs } from '../utils/customAttributes';
import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';

type Options<T extends TableRecord> = {
  customAttributeSchema: CustomAttributeSchema | CustomAttributeSchema[] | null;
  fields: TableFields<T>;
  enableRelativeDates: boolean;
};

/**
 * Add custom attributes field definitions
 *
 * @param options
 * @returns
 */
export const useAddCustomAttributeFieldDefinitions = <T extends TableRecord>({
  customAttributeSchema,
  fields,
  enableRelativeDates,
}: Options<T>): TableFieldsWithCustomAttributes<T> => {
  return useMemo(() => {
    const customFields = convertSchemasToFieldConfigs({
      customAttributeSchemas: customAttributeSchema
        ? Array.isArray(customAttributeSchema)
          ? customAttributeSchema
          : [customAttributeSchema]
        : [],
      enableRelativeDates,
    });

    return {
      ...fields,
      ...customFields,
    };
  }, [customAttributeSchema, enableRelativeDates, fields]);
};
