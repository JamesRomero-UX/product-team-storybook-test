import { type FieldTypeConfig, JsonSchemaType } from './types';

export const userMultiselect: FieldTypeConfig = {
  toJsonSchema: () => ({
    type: JsonSchemaType.Array,
  }),
};
