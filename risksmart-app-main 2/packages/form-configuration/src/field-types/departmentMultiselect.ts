import { type FieldTypeConfig, JsonSchemaType } from './types';

export const departmentMultiselect: FieldTypeConfig = {
  toJsonSchema: () => ({
    type: JsonSchemaType.Array,
  }),
};
