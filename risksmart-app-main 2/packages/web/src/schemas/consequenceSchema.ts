import {
  Consequence_Type_Enum,
  Cost_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { z } from 'zod';

import { CustomAttributeDataSchema } from './global';

export const ConsequenceFormSchema = z
  .object({
    Title: z.string().min(1, { message: 'Required' }),
    Description: z.string(),
    Criticality: z.number().nullish(),
    CostValue: z
      .number({ invalid_type_error: 'Required' })
      .multipleOf(0.01, 'Maximum of 2 d.p.')
      .max(99999999)
      .min(0),
    CostType: z.nativeEnum(Cost_Type_Enum, {
      invalid_type_error: 'Required',
    }),
    Type: z
      .nativeEnum(Consequence_Type_Enum, {
        invalid_type_error: 'Required',
      })
      .nullish(),
  })
  .and(CustomAttributeDataSchema);

export type ConsequenceFormFields = z.infer<typeof ConsequenceFormSchema>;

export const defaultValues: ConsequenceFormFields = {
  Title: '',
  Description: '',
  CustomAttributeData: null,
  Criticality: undefined as unknown as number,
  CostValue: undefined as unknown as number,
  CostType: undefined as unknown as Cost_Type_Enum,
  Type: null,
};
