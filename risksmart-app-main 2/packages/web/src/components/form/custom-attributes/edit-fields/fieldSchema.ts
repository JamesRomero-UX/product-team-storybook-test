import type { ControlElement, JsonSchema7 } from '@jsonforms/core';
import {
  conditionsSchema,
  CustomAttributeFieldType,
} from '@risksmart-app/form-configuration/src/field-types/types';
import { uniq } from 'lodash';
import { z } from 'zod';

import type { ConditionalField } from '../../form/conditional-fields-provider/conditionsGraph';
import { buildFieldConditionGraph } from '../../form/conditional-fields-provider/conditionsGraph';
import { fieldTypesConfig } from '../field-types';

const message = 'Required';
const defaultEmptyOptionCount = 1;

export const fieldOptionsSchema = z.object({
  EnableCustomLabel: z.boolean(),
  Description: z.string().nullish(),
  Required: z.boolean(),
  Hidden: z.boolean(),
  ReadOnly: z.boolean(),
  DefaultValue: z.string().nullish(),
  Conditions: conditionsSchema.nullish(),
});

const optionsSchema = z
  .array(
    z.object({
      Value: z.string(),
      AltValue: z.string().optional(),
      GeneratedId: z.string(),
      Persisted: z.boolean().optional(),
    })
  )
  .optional();

const customField = z.object({
  IsCustomField: z.literal(true),
  CustomFieldLabel: z.string().min(1, { message }),
  CustomFieldAltLabel: z.string().optional(),
  CustomFieldType: z.nativeEnum(CustomAttributeFieldType, {
    invalid_type_error: message,
  }),
  CustomFieldShowAltValues: z.boolean().default(false),
  CustomFieldOptions: optionsSchema,
});

const standardField = z.object({
  Label: z.string().nullable(),
  IsCustomField: z.literal(false),
});

const field = z.discriminatedUnion('IsCustomField', [
  customField,
  standardField,
]);

export const getFieldSchema = (
  currentFieldId: string,
  fields: ConditionalField[]
) =>
  field.and(fieldOptionsSchema).superRefine((values, ctx) => {
    const allFields = [
      { FieldId: currentFieldId, Conditions: values.Conditions },
      ...fields.filter((f) => f.FieldId !== currentFieldId),
    ];

    if (currentFieldId && values.Conditions) {
      const graph = buildFieldConditionGraph(allFields);
      if (graph.hasCycles()) {
        ctx.addIssue({
          message:
            'Circular references detected in conditional logic. Please review and remove any circular references',
          code: z.ZodIssueCode.custom,
          path: ['Conditions'],
        });
      }
    }

    if (!values.IsCustomField) {
      return;
    }
    const fieldConfig = fieldTypesConfig[values.CustomFieldType];
    if (fieldConfig.hasOptions) {
      const options = values.CustomFieldOptions;

      if (
        options &&
        uniq(options.flatMap((o) => o.Value)).length !== options.length
      ) {
        ctx.addIssue({
          message: 'Options must be unique',
          code: z.ZodIssueCode.custom,
          path: ['global'],
        });
      }

      if (values.CustomFieldShowAltValues) {
        if (!values.CustomFieldAltLabel) {
          ctx.addIssue({
            message: 'Label value is required when show values is enabled',
            code: z.ZodIssueCode.custom,
            path: ['global'],
          });
        }

        options?.forEach((o) => {
          if (!o.AltValue) {
            ctx.addIssue({
              message:
                'All options must have a value when show values is enabled',
              code: z.ZodIssueCode.custom,
              path: ['global'],
            });
          }
        });

        // alternate values are optional, but if they are provided, they must be unique
        const altValues = options
          ?.map((v) => v.AltValue?.trim())
          .filter(Boolean);

        if (altValues) {
          if (altValues.length && uniq(altValues).length !== altValues.length) {
            ctx.addIssue({
              message: 'Option values must be unique',
              code: z.ZodIssueCode.custom,
              path: ['global'],
            });
          }
        }
      }

      const hasAnyEmptyOptions = options?.reduce((acc, option) => {
        if (!option.Value) {
          return true;
        }

        return acc;
      }, false);

      if (hasAnyEmptyOptions) {
        ctx.addIssue({
          message: 'Each option must have a value',
          code: z.ZodIssueCode.custom,
          path: ['global'],
        });
      }
      if (options?.length === 0) {
        ctx.addIssue({
          message: 'There must be at least one option',
          code: z.ZodIssueCode.custom,
          path: ['global'],
        });
      }
    }
  });

export type FieldFormFields = z.infer<ReturnType<typeof getFieldSchema>>;
export type FormFieldOptions = z.infer<typeof fieldOptionsSchema>;
export type OptionsSchema = z.infer<typeof optionsSchema>;

export const defaultValues: FieldFormFields = {
  EnableCustomLabel: true,
  IsCustomField: true,
  CustomFieldLabel: '',
  CustomFieldAltLabel: '',
  CustomFieldType: CustomAttributeFieldType.Text,
  CustomFieldOptions: Array.from({ length: defaultEmptyOptionCount }, () => ({
    Value: '',
    AltValue: '',
    GeneratedId: crypto.randomUUID(),
  })),
  Required: false,
  Hidden: false,
  ReadOnly: false,
  DefaultValue: null,
  CustomFieldShowAltValues: false,
};

export interface JsonSchemaField {
  schema: JsonSchema7;
  control: ControlElement;
  attributeName: string;
}
