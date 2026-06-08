import type { JsonSchema7 } from '@jsonforms/core';

export interface CustomAttributeProps<T = string> {
  value: T;
  onChange(value: null | T): void;
  label: string;
  altLabel?: string;
  disabled?: boolean;
  error?: string;
  description?: string;
  schema: JsonSchema7;
}
