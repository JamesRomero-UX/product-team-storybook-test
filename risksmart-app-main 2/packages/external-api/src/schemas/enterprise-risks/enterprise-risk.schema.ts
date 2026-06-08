import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const EnterpriseRiskResponseSchema = baseEntitySchema.extend({
  tier: z
    .number()
    .int()
    .nonnegative()
    .openapi({ example: 0, description: 'Enterprise risk tier (always 0)' }),
  treatment: z
    .string()
    .nullable()
    .openapi({ example: 'Mitigate', description: 'Treatment strategy' }),
});

export const EnterpriseRiskListResponseSchema =
  EnterpriseRiskResponseSchema.extend({
    links: listLinksSchema,
  }).strict();

export const EnterpriseRiskItemResponseSchema =
  EnterpriseRiskResponseSchema.extend({
    score: z
      .object({
        inherentScoreMean: z.number().nullable().openapi({
          example: 12.5,
          description: 'Mean inherent score across linked risks',
        }),
        residualScoreMean: z.number().nullable().openapi({
          example: 6.3,
          description: 'Mean residual score across linked risks',
        }),
        inherentRatingMean: z
          .number()
          .nullable()
          .openapi({ example: 3.8, description: 'Mean inherent rating band' }),
        residualRatingMean: z
          .number()
          .nullable()
          .openapi({ example: 2.1, description: 'Mean residual rating band' }),
      })
      .nullable(),
    links: baseLinksSchema,
  }).strict();

export type EnterpriseRiskItemResponse = z.infer<
  typeof EnterpriseRiskItemResponseSchema
>;
export type EnterpriseRiskListResponse = z.infer<
  typeof EnterpriseRiskListResponseSchema
>;
