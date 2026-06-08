import { z } from 'zod';

export const selectedFieldSchema = z.object({
  label: z.string().nullish(),
  fieldId: z.string(),
});

export const selectedFieldsSchema = z.object({
  fields: z.array(selectedFieldSchema),
});

export type SelectedFields = z.infer<typeof selectedFieldsSchema>;

export const defaultValues: SelectedFields = { fields: [] };

export type SelectedField = z.infer<typeof selectedFieldSchema>;
