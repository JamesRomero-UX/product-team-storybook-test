import type {
  ControlElement,
  JsonSchema7,
  VerticalLayout,
} from '@jsonforms/core';
import { z } from 'zod';

import type { Field } from '../sheets/Sheet';
import type { CustomAttributeSchemaData } from '../sheets/types';
import { dateTimeString } from './sharedSchemas';

export const customAttributeFields = (
  customAttributeSchema: CustomAttributeSchemaData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Field<any>[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customAttributeFields: Field<any>[] = [];
  const jsonSchema: JsonSchema7 = customAttributeSchema?.Schema;
  const layout = customAttributeSchema?.UiSchema as VerticalLayout;
  const controls = layout.elements.filter(
    (e) => e.type === 'Control'
  ) as ControlElement[];
  for (const property in jsonSchema.properties) {
    const control = controls.find((c) => c.scope.endsWith(property));
    if (!control) {
      throw new Error(`No control found for ${property}`);
    }
    const label = control.label as string;
    if (!label) {
      throw new Error(`No label found for control ${property}`);
    }
    customAttributeFields.push({
      key: label,
      type: 'string',
    });
  }

  return customAttributeFields;
};

export const customAttributeDbFormat = (
  customAttributeSchema: CustomAttributeSchemaData
): { [label: string]: string } => {
  const labelKeyMapping: { [label: string]: string } = {};
  const jsonSchema: JsonSchema7 = customAttributeSchema?.Schema;
  const layout = customAttributeSchema?.UiSchema as VerticalLayout;
  const controls = layout.elements.filter(
    (e) => e.type === 'Control'
  ) as ControlElement[];
  for (const property in jsonSchema.properties) {
    const control = controls.find((c) => c.scope.endsWith(property));
    if (!control) {
      throw new Error(`No control found for ${property}`);
    }
    const label = control.label as string;
    if (!label) {
      throw new Error(`No label found for control ${property}`);
    }
    labelKeyMapping[label] = property;
  }

  return labelKeyMapping;
};

export const convertJsonSchemaToZod = (
  customAttributeSchema: CustomAttributeSchemaData
) => {
  let customAttributeZodSchema = z.object({});
  const jsonSchema: JsonSchema7 = customAttributeSchema?.Schema;
  const layout = customAttributeSchema?.UiSchema as VerticalLayout;
  const controls = layout.elements.filter(
    (e) => e.type === 'Control'
  ) as ControlElement[];
  for (const property in jsonSchema.properties) {
    const schema = jsonSchema.properties[property];
    if (!schema) {
      throw new Error('Missing schema');
    }

    const control = controls.find((c) => c.scope.endsWith(property));
    if (!control) {
      throw new Error(`No control found for ${property}`);
    }
    const label = control.label as string;
    if (!label) {
      throw new Error(`No label found for control ${property}`);
    }
    let fieldSchema;
    if (schema.enum) {
      const enumVal = schema.enum as string[];
      if (schema.type == 'array') {
        fieldSchema = z.coerce
          .string()
          .transform((value) => value.split(';').map(String))
          .refine(
            (values) => {
              return values.every((value) => enumVal.includes(value));
            },
            (values) => ({
              message: `"${values
                .filter((val) => !enumVal.includes(val))
                .join(',')}" not in ${enumVal
                .map((val) => `"${val}"`)
                .join(',')}`,
            })
          )
          .nullable();
      } else {
        fieldSchema = z.coerce
          .string()
          .refine(
            (val) => {
              return enumVal.includes(val);
            },
            (val) => ({
              message: `"${val}" not in ${enumVal
                .map((val) => `"${val}"`)
                .join(',')}`,
            })
          )
          .nullable();
      }
    } else if (schema.format === 'date') {
      fieldSchema = dateTimeString.nullable();
    } else {
      fieldSchema = z
        .string()
        .or(z.number())
        .nullable()
        .transform((val) => {
          if (val === null) {
            return val;
          }

          return val.toString();
        });
    }
    customAttributeZodSchema = customAttributeZodSchema.merge(
      z.object({
        [label]: fieldSchema,
      })
    );
  }

  return customAttributeZodSchema;
};
