import { z } from 'zod';

export const createIndicatorResultRequestSchema = z
  .object({
    Description: z.string().nullable().optional(),
    IndicatorId: z.string().uuid('IndicatorId must be a valid UUID'),
    ResultDate: z
      .string()
      .datetime('ResultDate must be a valid datetime string'),
    TargetValueNum: z.number().nullable().optional(),
    TargetValueTxt: z.string().nullable().optional(),
    CustomAttributeData: z
      .record(z.string(), z.unknown())
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      const hasNum = data.TargetValueNum != null;
      const hasTxt = data.TargetValueTxt != null;

      return (hasNum && !hasTxt) || (!hasNum && hasTxt);
    },
    {
      message:
        'Exactly one of TargetValueNum or TargetValueTxt must be provided',
    }
  );

export type CreateIndicatorResultRequest = z.infer<
  typeof createIndicatorResultRequestSchema
>;

export const updateIndicatorResultRequestSchema = z.object({
  Id: z.string().uuid(),
  Description: z.string().nullish(),
  ResultDate: z.string().datetime('ResultDate must be a valid datetime string'),
  TargetValueNum: z.number().nullish(),
  TargetValueTxt: z.string().nullish(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
});

export type UpdateIndicatorResultRequest = z.infer<
  typeof updateIndicatorResultRequestSchema
>;

export const deleteIndicatorResultsRequestSchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid indicator result ID format'))
    .min(1, 'At least one ID is required')
    .max(200, 'Maximum 200 IDs allowed per request'),
});

export type DeleteIndicatorResultsRequest = z.infer<
  typeof deleteIndicatorResultsRequestSchema
>;
