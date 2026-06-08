import type { JsonSchema7 } from '@jsonforms/core';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import { z } from 'zod';

export enum JsonSchemaType {
  Array = 'array',
  Boolean = 'boolean',
  Null = 'null',
  Number = 'number',
  Object = 'object',
  String = 'string',
}

export enum JsonSchemaFormat {
  Date = 'date',
  Link = 'uri',
}

export interface FieldTypeConfig {
  /**
   * Map to json schema for saving to the database
   */
  toJsonSchema: (data: PutCustomFieldData) => JsonSchema7;
}

export type Option =
  | { _tag: 'StringOption'; Value: string }
  | { _tag: 'AltValueOption'; AltValue: string; Value: string };

export interface PutCustomFieldData {
  IsCustomField: true;
  Description: string | null | undefined;
  Options: Option[];
  Label: string;
  AltLabel?: string;
}

export enum CustomAttributeFieldType {
  Date = 'date',
  DepartmentMultiSelect = 'departmentmultiselect',
  Link = 'link',
  MultiSelect = 'multiselect',
  Select = 'select',
  Text = 'text',
  Textarea = 'textarea',
  UserMultiSelect = 'usermultiselect',
}

const customAttributeFieldTypes = new Set<CustomAttributeFieldType>(
  Object.values(CustomAttributeFieldType)
);

export const isCustomAttributeFieldType = (
  value: string
): value is CustomAttributeFieldType =>
  // Set.has is typed as (value: T) — TypeScript won't accept a supertype (string); safe as this is the runtime membership check.
  customAttributeFieldTypes.has(value as CustomAttributeFieldType);

/**
 * Concrete type for FormFieldConfigurationInsertInput
 * Extracted from generated GraphQL types to avoid dependency on generated types
 */
export interface FormFieldConfigurationInsertInput {
  Conditions?: Conditions | null;
  CreatedAtTimestamp?: string | null;
  CreatedByUser?: string | null;
  DefaultValue?: string | null;
  Description?: string | null;
  FieldId?: string | null;
  FormConfigurationParentType?: ParentType | null;
  Hidden?: boolean | null;
  Label?: string | null;
  ModifiedAtTimestamp?: string | null;
  ModifiedByUser?: string | null;
  OrgKey?: string | null;
  ReadOnly?: boolean | null;
  Required?: boolean | null;
}

const operatorEnum = z.enum(['=', '>', '<', '>=', '<=', ':', '!=', '!:']);

const token = z.object({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: z.custom<Required<any>>((x) => x !== undefined),
  propertyKey: z.string(),
  operator: operatorEnum,
});
export type Token = z.infer<typeof token>;

const operationEnum = z.enum(['and', 'or']);

export type Operation = z.infer<typeof operationEnum>;

const tokenGroup = z.object({
  operation: operationEnum,
  tokens: z.array(token),
});
export type TokenGroup = z.infer<typeof tokenGroup>;

export const conditionsSchema = z.object({
  operation: operationEnum,
  tokens: z.array(token).max(0), // Don't use this
  tokenGroups: z.array(token.or(tokenGroup)),
});
export type Conditions = z.infer<typeof conditionsSchema>;
