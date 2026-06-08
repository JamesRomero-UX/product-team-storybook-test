import {
  type FieldTypeConfig,
  JsonSchemaFormat,
  JsonSchemaType,
} from './types';

export const date: FieldTypeConfig = {
  toJsonSchema: () => ({
    type: JsonSchemaType.String,
    format: JsonSchemaFormat.Date,
  }),
};
