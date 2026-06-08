import { z } from 'zod';

import { CustomAttributeDataSchema } from './global';

export const ImpactSchema = z
  .object({
    Description: z.string().min(1, { message: 'Required' }),
    ImpactRating: z.number({ message: 'Required' }),
  })
  .and(CustomAttributeDataSchema);

export type ImpactFormFields = z.infer<typeof ImpactSchema>;

export const defaultValues: ImpactFormFields = {
  Description: '',
  ImpactRating: 0,
  CustomAttributeData: null,
};
