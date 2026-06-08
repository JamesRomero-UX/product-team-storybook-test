import { z } from 'zod';

import { CustomAttributeDataSchema } from '../../../../schemas/global';

export const CauseFormSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string().nullish(),
    Significance: z.number().int().min(1).max(5).nullish(),
  })
  .and(CustomAttributeDataSchema);

export type CauseFormFields = z.infer<typeof CauseFormSchema>;

export const defaultValues: CauseFormFields = {
  Title: '',
  Description: '',
  CustomAttributeData: null,
  Significance: null,
};
