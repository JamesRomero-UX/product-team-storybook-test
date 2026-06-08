import { z } from 'zod';

export const ScimTokenFormSchema = z.object({
  expireInMonths: z.enum(['6', '12', '24']),
});

export type ScimTokenFormFields = z.infer<typeof ScimTokenFormSchema>;

export const defaultValues: ScimTokenFormFields = {
  expireInMonths: '12',
};
