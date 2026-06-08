import { type FieldTypeConfig, JsonSchemaType } from './types';

export const textArea: FieldTypeConfig = {
  toJsonSchema: () => ({
    type: JsonSchemaType.String,
  }),
};
