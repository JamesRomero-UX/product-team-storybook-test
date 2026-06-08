import { CustomFieldsInputSchema } from '../common/custom-fields.schema';
import { z } from '../openapi.zod';

const indicatorResultFields = {
  resultDate: z.string().datetime({ offset: true }).openapi({
    description: 'Date and time the result was recorded',
    example: '2024-03-15T09:00:00Z',
  }),
  description: z
    .string()
    .nullish()
    .openapi({ description: 'Add result details', example: 'result details' }),
  targetValueNum: z.number().nullish().openapi({
    description: 'set this or targetValueTxt, never both',
    example: 5,
  }),
  targetValueTxt: z.string().nullish().openapi({
    description: 'set this or targetValueNum, never both',
    example: 'ok',
  }),
  customFields: CustomFieldsInputSchema,
} as const;

const targetValueMutualExclusivity = (
  value: { targetValueNum?: number | null; targetValueTxt?: string | null },
  ctx: z.RefinementCtx
) => {
  const hasNum =
    value.targetValueNum !== null && value.targetValueNum !== undefined;
  const hasTxt =
    value.targetValueTxt !== null && value.targetValueTxt !== undefined;

  if (hasNum && hasTxt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Cannot set both targetValueNum and targetValueTxt. Use targetValueNum for number indicators or targetValueTxt for text indicators.',
      path: ['targetValueNum'],
    });
  }
};

export const indicatorResultMutateRequestSchema = z
  .object(indicatorResultFields)
  .superRefine(targetValueMutualExclusivity);

export const createIndicatorResultRequestSchema =
  indicatorResultMutateRequestSchema;

export const updateIndicatorResultRequestSchema =
  indicatorResultMutateRequestSchema;

export type CreateIndicatorResultRequest = z.infer<
  typeof indicatorResultMutateRequestSchema
>;

export type UpdateIndicatorResultRequest = CreateIndicatorResultRequest;
