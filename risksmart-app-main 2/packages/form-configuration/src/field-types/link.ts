import {
  type FieldTypeConfig,
  JsonSchemaFormat,
  JsonSchemaType,
} from './types';

export const link: FieldTypeConfig = {
  toJsonSchema: () => ({
    type: JsonSchemaType.String,
    format: JsonSchemaFormat.Link,
  }),
};
