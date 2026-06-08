import { isoDateTimeValue } from '../../utils/schemas';
import { z } from '../openapi.zod';

const IdMs = z.string().regex(/^\d{13}$/);

export const CustomFieldInputSchema = z.object({
  id: IdMs,
  value: z.union([z.string(), z.number(), z.array(z.string()), z.boolean()]),
});
export const CustomFieldsInputSchema = z
  .array(CustomFieldInputSchema)
  .optional();
export type CustomFieldInput = z.infer<typeof CustomFieldInputSchema>;
export type CustomFieldsInput = z.infer<typeof CustomFieldsInputSchema>;

const value = z
  .union([
    z.string(),
    z.number(),
    z.array(z.string()).readonly(),
    z.null(),
    z.boolean(),
  ])
  .openapi({
    description: 'Default value for the field, or null if none',
    example: null,
  });

const CustomFieldData = z
  .object({
    id: IdMs,
    value,
    label: z.string().optional(),
  })
  .strict();

const CustomFieldMetadata = z
  .object({
    label: z.string().optional().openapi({
      description: 'Display label for the custom field',
      example: 'Business Impact',
    }),
    kind: z.string().openapi({
      description: 'Field type (e.g. text, number, select, date, boolean)',
      example: 'text',
    }),
    description: z.string().optional().openapi({
      description: 'Optional description of the field purpose',
      example: 'Describe the business impact of this risk',
    }),
    hidden: z.boolean().openapi({
      description: 'Whether this field is hidden from the UI',
      example: false,
    }),
    readOnly: z.boolean().openapi({
      description: 'Whether this field is read-only',
      example: false,
    }),
    required: z.boolean().openapi({
      description: 'Whether this field is required for create actions',
      example: true,
    }),
    defaultValue: z
      .union([z.string(), z.number(), z.array(z.string()).readonly(), z.null()])
      .openapi({
        description: 'Default value for the field, or null if none',
        example: null,
      }),
    enum: z
      .array(z.string())
      .optional()
      .openapi({
        description: 'Allowed values for select/multiselect fields',
        example: ['Low', 'Medium', 'High'],
      }),
    format: z.string().optional().openapi({
      description: 'Format hint for the field (e.g. date, email)',
      example: 'date',
    }),
    uniqueItems: z.boolean().optional().openapi({
      description: 'For array fields, whether values must be unique',
      example: true,
    }),
    color: z.string().optional().openapi({
      description: 'Display color associated with the field',
      example: '#FF5733',
    }),
  })
  .strict();

const CustomFieldsCompact = z.record(
  IdMs,
  z
    .object({
      data: CustomFieldData,
    })
    .strict()
);

const CustomFieldsExpanded = z.record(
  IdMs,
  z
    .object({
      data: CustomFieldData,
      metadata: CustomFieldMetadata.nullable(),
    })
    .strict()
);

const SchemaProp = z
  .object({
    type: z
      .enum(['string', 'number', 'integer', 'boolean', 'array', 'object'])
      .optional(),
    format: z.string().optional(),
    enum: z.array(z.string()).optional(),
    description: z.string().optional(),
    uniqueItems: z.boolean().optional(),
  })
  .strict();

export const PropertiesSchema = z.record(z.string(), SchemaProp);

export const customAttributeDataSchema = z.record(
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()).readonly(),
    z.null(),
  ])
);

export const CustomAttributesResponseCompactSchema = z
  .object({
    schemaUpdatedAt: isoDateTimeValue,
    fields: CustomFieldsCompact,
  })
  .strict();

export const CustomAttributesResponseExpandedSchema = z
  .object({
    schemaUpdatedAt: isoDateTimeValue,
    fields: CustomFieldsExpanded,
  })
  .strict();

const ResourceSchemaFields = z.record(
  IdMs,
  CustomFieldMetadata.extend({
    id: IdMs.openapi({
      description: 'Unique identifier for the custom field',
      example: '1759763674112',
    }),
  })
);

export const ResourceSchemaResponseSchema = z
  .object({
    customFields: z
      .object({
        schemaVersion: isoDateTimeValue.nullable().openapi({
          description:
            'Timestamp of the last schema update (ISO 8601), or null if no schema has been defined',
          example: '2025-10-06T15:31:23.421232Z',
        }),
        fields: ResourceSchemaFields.openapi({
          description: 'Map of custom field definitions keyed by field ID',
        }),
      })
      .strict(),
  })
  .strict()
  .openapi('ResourceSchemaResponse');

export type ResourceSchemaResponse = z.infer<
  typeof ResourceSchemaResponseSchema
>;

export type CustomAttributesResponseCompact = z.infer<
  typeof CustomAttributesResponseCompactSchema
>;
export type CustomAttributesResponseExpanded = z.infer<
  typeof CustomAttributesResponseExpandedSchema
>;
