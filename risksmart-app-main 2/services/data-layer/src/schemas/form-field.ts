import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import {
  conditionsSchema,
  CustomAttributeFieldType,
} from '@risksmart-app/form-configuration/src/field-types/types';
import { z } from 'zod';

/**
 * Option field schemas for custom attribute fields
 */
const stringOption = z.object({
  _tag: z.literal('StringOption'),
  Value: z.string(),
});

const altValueOption = z.object({
  _tag: z.literal('AltValueOption'),
  AltValue: z.string(),
  Value: z.string(),
});

export const optionFieldSchema = z.discriminatedUnion('_tag', [
  stringOption,
  altValueOption,
]);

/**
 * Common fields shared across create/update operations
 */
const commonFieldsSchema = z.object({
  ParentType: z.nativeEnum(ParentTypes),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: z.boolean(),
  DefaultValue: z.string().nullish(),
  Conditions: conditionsSchema.nullish(),
});

/**
 * Schema for POST /form-fields - creates a new custom attribute field
 */
export const createFormFieldRequestSchema = z
  .object({
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    IsCustomField: z.literal(true),
    Label: z.string().min(1, 'Label is required'),
    AltLabel: z.string().optional(),
    Description: z.string().nullish(),
    Type: z.nativeEnum(CustomAttributeFieldType),
    Options: z.array(optionFieldSchema),
  })
  .merge(commonFieldsSchema);

export type CreateFormFieldRequest = z.infer<
  typeof createFormFieldRequestSchema
>;

/**
 * Custom field update schema
 */
const updateCustomFieldSchema = z.object({
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsCustomField: z.literal(true),
  Label: z.string().min(1, 'Label is required for custom fields'),
  AltLabel: z.string().optional(),
  Description: z.string().nullish(),
  Options: z.array(optionFieldSchema),
});

/**
 * Standard field update schema
 */
const updateStandardFieldSchema = z.object({
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsCustomField: z.literal(false),
  Label: z.string().nullish(),
  Description: z.string().nullish(),
});

/**
 * Schema for PUT /form-fields - updates an existing field (custom or standard)
 */
export const updateFormFieldRequestSchema = z
  .discriminatedUnion('IsCustomField', [
    updateCustomFieldSchema,
    updateStandardFieldSchema,
  ])
  .and(commonFieldsSchema)
  .and(
    z.object({
      /**
       * Field identifier - CustomAttributeData.[timestamp]_[type] for custom fields,
       * or standard field ID for standard fields
       */
      FieldId: z.string().min(1, 'FieldId is required'),
    })
  );

export type UpdateFormFieldRequest = z.infer<
  typeof updateFormFieldRequestSchema
>;

/**
 * Schema for DELETE /form-fields - deletes a custom attribute field
 */
export const deleteFormFieldRequestSchema = z.object({
  ParentType: z.nativeEnum(ParentTypes),
  /**
   * Field identifier - CustomAttributeData.[timestamp]_[type] for custom fields
   */
  FieldId: z.string().min(1, 'FieldId is required'),
});

export type DeleteFormFieldRequest = z.infer<
  typeof deleteFormFieldRequestSchema
>;
