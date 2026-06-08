import {
  CustomAttributeDataSchema,
  UserOrGroupsSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const ImpactFormSchema = z
  .object({
    Name: z.string().min(1, { message: 'Required' }),
    Rationale: z.string().nullable(),
    RatingGuidance: z.string().nullable(),
    Owners: UserOrGroupsSchema,
    LikelihoodAppetite: z.number().int().min(1).max(5).nullish(),
  })
  .and(CustomAttributeDataSchema);

export type ImpactFormFieldData = z.infer<typeof ImpactFormSchema>;

export const defaultValues: ImpactFormFieldData = {
  Owners: [],
  Name: '',
  Rationale: '',
  RatingGuidance: '',
  LikelihoodAppetite: null as unknown as number,
};
