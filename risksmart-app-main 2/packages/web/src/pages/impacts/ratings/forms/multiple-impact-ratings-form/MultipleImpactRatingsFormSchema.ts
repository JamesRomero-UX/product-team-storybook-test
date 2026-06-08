import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import dayjs from 'dayjs';
import {
  CustomAttributeDataSchema,
  StringDateSchema,
  UserOptionSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const MultipleImpactRatingsFormSchema = z
  .object({
    TestDate: StringDateSchema,
    Ratings: z.array(
      z.object({
        ImpactId: z
          .string({ invalid_type_error: 'Required' })
          .uuid({ message: 'Required' }),
        Rating: z.number({ invalid_type_error: 'Required' }),
      })
    ),
    Likelihood: z.number().nullish(),
    CompletedBy: UserOptionSchema.nullish(),
  })
  .superRefine((val, ctx) => {
    if (val.Ratings.length === 0) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['global'],
        message: 'At least 1 impact required for rating',
      });
    }
    val.Ratings.map((rating) => {
      if (rating.Rating < 0) {
        return ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['global'],
          message: 'A rating must be provided for each impact',
        });
      }
    });
  })
  .and(CustomAttributeDataSchema);

export type ImpactRatingsFormFieldData = z.infer<
  typeof MultipleImpactRatingsFormSchema
>;

export const useDefaultValues = (): ImpactRatingsFormFieldData => {
  const { user } = useRisksmartUser();
  if (!user) {
    throw new Error('Use not logged in');
  }

  return {
    Ratings: [],
    TestDate: dayjs().format('YYYY-MM-DD'),
    CompletedBy: { value: user.userId, type: 'user' },
  };
};
