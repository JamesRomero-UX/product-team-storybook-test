import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
  StringDateSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

export const TestResultSharedSchema = z
  .object({
    Title: z.string().nullable().optional(),
    TestType: z
      .string({
        required_error: 'Required',
        invalid_type_error: 'Required',
      })
      .nullable(),
    Description: z.string().nullable(),
    DesignEffectiveness: z.number().int().min(0).max(4).nullish(),
    PerformanceEffectiveness: z.number().int().min(0).max(4).nullish(),
    OverallEffectiveness: z.number().int().min(0).max(4).nullish(),
    Submitter: z.string().min(1, { message: 'Required' }),
    TestDate: NullableStringDateSchema,
  })
  .and(CustomAttributeDataSchema);

export const Put = z.object({
  object: z
    .object({
      Id: z.string().uuid(),
      OriginalTimestamp: StringDateSchema,
      ParentControlId: z.string().uuid(),
    })
    .and(TestResultSharedSchema),
});
