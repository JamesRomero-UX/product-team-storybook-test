import { type FieldTypeConfig, JsonSchemaType } from './types';

export const text: FieldTypeConfig = {
  toJsonSchema: () => ({
    type: JsonSchemaType.String,
  }),
};
