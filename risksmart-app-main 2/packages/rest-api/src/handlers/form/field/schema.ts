import {
  conditionsSchema,
  CustomAttributeFieldType,
} from '@risksmart-app/form-configuration/src/field-types/types';
import { ParentTypeEnum } from 'generated/graphql';
import { z } from 'zod';

const stringOption = z.object({
  _tag: z.literal('StringOption'),
  Value: z.string(),
});

const AltValueOption = z.object({
  _tag: z.literal('AltValueOption'),
  AltValue: z.string(),
  Value: z.string(),
});

export const optionField = z.discriminatedUnion('_tag', [
  stringOption,
  AltValueOption,
]);

const postField = z.object({
  IsCustomField: z.literal(true),
  Label: z.string().min(1),
  AltLabel: z.string().optional(),
  Description: z.string().nullish(),
  Type: z.nativeEnum(CustomAttributeFieldType),
  Options: z.array(optionField),
});

export const putCustomField = z.object({
  IsCustomField: z.literal(true),
  Description: z.string().nullish(),
  Options: z.array(optionField),
  Label: z.string().min(1),
  AltLabel: z.string().optional(),
});

const putStandardField = z.object({
  IsCustomField: z.literal(false),
  Label: z.string().nullish(),
});

const putField = z.discriminatedUnion('IsCustomField', [
  putCustomField,
  putStandardField,
]);

const common = z.object({
  ParentType: z.nativeEnum(ParentTypeEnum),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: z.boolean(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: z.boolean(),
  DefaultValue: z.string().nullish(),
  Description: z.string().nullish(),
  Conditions: conditionsSchema.nullish(),
});

export const PostSchema = z.object({
  object: postField.and(common).and(
    z.object({
      Type: z.nativeEnum(CustomAttributeFieldType),
    })
  ),
});

export const PutSchema = z.object({
  object: putField.and(common).and(
    z.object({
      /**
       * In the format CustomAttributeData.[unix timestamp]_[type] for custom attributes,
       * and [formFieldId] for standard fields.
       */
      FieldId: z.string(),
    })
  ),
});

export const DeleteSchema = z.object({
  object: z.object({
    ParentType: z.nativeEnum(ParentTypeEnum),
    /**
     * In the format CustomAttributeData.[unix timestamp]_[type] for custom attributes,
     * and [formFieldId] for standard fields.
     */
    FieldId: z.string(),
  }),
});
