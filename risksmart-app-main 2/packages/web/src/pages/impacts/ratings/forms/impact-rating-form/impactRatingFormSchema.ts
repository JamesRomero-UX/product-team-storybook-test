import type { UserOption } from 'src/schemas/global';
import {
  CustomAttributeDataSchema,
  StringDateSchema,
  UserOptionSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const ImpactRatingFormSchema = z
  .object({
    ImpactId: z
      .string({ invalid_type_error: 'Required' })
      .uuid({ message: 'Required' }),
    RatedItemId: z
      .string({ invalid_type_error: 'Required' })
      .uuid({ message: 'Required' }),
    TestDate: StringDateSchema,
    Rating: z
      .number({ invalid_type_error: 'Required' })
      .int({ message: 'Required' })
      .min(0),
    CompletedBy: UserOptionSchema.nullish(),
    Likelihood: z.number().nullish(),
  })
  .and(CustomAttributeDataSchema);

export type ImpactRatingFormFieldData = z.infer<typeof ImpactRatingFormSchema>;

export const defaultValues: ImpactRatingFormFieldData = {
  Rating: null as unknown as number,
  RatedItemId: null as unknown as string,
  ImpactId: null as unknown as string,
  TestDate: null as unknown as string,
  CompletedBy: null as unknown as UserOption,
};
