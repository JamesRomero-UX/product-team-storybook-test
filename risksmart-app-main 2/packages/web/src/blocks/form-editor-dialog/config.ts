import { z } from 'zod';

const conditionalLogicRulesSchema = z
  .array(
    z.object({
      ifField: z.string().min(1, 'Field is required'),
      values: z.array(z.string()),
      showField: z.string().min(1, 'Field is required'),
    })
  )
  .optional()
  .default([]);

const optionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Option label is required'),
});

export const OPTION_FIELD_TYPES = ['radio', 'dropdown', 'multiselect'] as const;

export const isOptionFieldType = (type: string): boolean =>
  (OPTION_FIELD_TYPES as readonly string[]).includes(type);

export const sectionEditorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  conditionalLogicEnabled: z.boolean().default(false),
  conditionalLogicRules: conditionalLogicRulesSchema,
  guidanceEnabled: z.boolean().default(false),
  guidance: z.string().optional(),
});

export const fieldEditorSchema = z
  .object({
    fieldType: z.string().min(1, 'Field type is required'),
    fieldName: z.string().min(1, 'Field name is required'),
    required: z.boolean().optional().default(false),
    readOnly: z.boolean().optional().default(false),
    options: z.array(optionSchema).optional().default([]),
    conditionalLogicEnabled: z.boolean().default(false),
    conditionalLogicRules: conditionalLogicRulesSchema,
    guidanceEnabled: z.boolean().default(false),
    guidance: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (isOptionFieldType(data.fieldType) && data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least 2 options are required',
        path: ['options'],
      });
    }

    if (isOptionFieldType(data.fieldType)) {
      const labels = data.options.map((o) => o.label.trim().toLowerCase());
      const seen = new Set<string>();
      labels.forEach((label, index) => {
        if (seen.has(label)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Option labels must be unique',
            path: ['options', index, 'label'],
          });
        }
        seen.add(label);
      });
    }
  });

export type SectionEditorValues = z.infer<typeof sectionEditorSchema>;
export type FieldEditorValues = z.infer<typeof fieldEditorSchema>;
