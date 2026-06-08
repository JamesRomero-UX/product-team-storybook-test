import {
  createResourceHref,
  isoDateTimeValue,
  scheduleAndStateSchema,
} from '../../utils/schemas';
import { baseEntitySchema, listLinksSchema } from '../common/base.schema';
import { z } from '../openapi.zod';

const riskExamplePathSlug =
  '/api/v1/risks/3fa85f64-5717-4562-b3fc-2c963f66afa6';

// risk ratings schemas
export const RiskRatingBaseSchema = baseEntitySchema
  .omit({
    title: true,
    description: true,
    sequentialId: true,
  })
  .extend({
    links: listLinksSchema,
  });

export const RiskRatingItemSchema = RiskRatingBaseSchema.extend({
  controlType: z.string().min(1).openapi({
    example: 'Preventive',
    description: 'Type of control for this rating',
  }),
  likelihood: z
    .number()
    .nullable()
    .openapi({ example: 3, description: 'Likelihood score' }),
  impact: z
    .number()
    .nullable()
    .openapi({ example: 4, description: 'Impact score' }),
  rating: z
    .number()
    .nullable()
    .openapi({ example: 12, description: 'Combined risk rating' }),
  rationale: z.string().nullable().openapi({
    example: 'Based on Q3 assessment',
    description: 'Explanation for this rating',
  }),
  ratingType: z.string().min(1).openapi({
    example: 'Residual',
    description: 'Inherent or residual rating',
  }),
  testDate: isoDateTimeValue
    .nullable()
    .openapi({ description: 'Date of the most recent control test' }),
}).strict();

export const RiskRatingListSchema = z.array(RiskRatingBaseSchema.strict());

//risk schemas
const extendedLinks = {
  controls: createResourceHref(`${riskExamplePathSlug}/controls`),
  actions: createResourceHref(`${riskExamplePathSlug}/actions`),
  indicators: createResourceHref(`${riskExamplePathSlug}/indicators`),
  appetites: createResourceHref(`${riskExamplePathSlug}/appetites`),
  ratings: createResourceHref(`${riskExamplePathSlug}/ratings`),
  impacts: createResourceHref(`${riskExamplePathSlug}/impacts`),
  acceptances: createResourceHref(`${riskExamplePathSlug}/acceptances`),
  approvals: createResourceHref(`${riskExamplePathSlug}/approvals`),
};

const riskScore = {
  residualScore: z
    .number()
    .nullable()
    .openapi({ example: 6, description: 'Residual risk score after controls' }),
  residualRating: z
    .number()
    .nullable()
    .openapi({ example: 2, description: 'Residual risk rating band' }),
  inherentScore: z.number().nullable().openapi({
    example: 12,
    description: 'Inherent risk score before controls',
  }),
  inherentRating: z
    .number()
    .nullable()
    .openapi({ example: 4, description: 'Inherent risk rating band' }),
  residualImpact: z
    .number()
    .nullable()
    .openapi({ example: 3, description: 'Residual impact score' }),
  residualLikelihood: z
    .number()
    .nullable()
    .openapi({ example: 2, description: 'Residual likelihood score' }),
  inherentImpact: z
    .number()
    .nullable()
    .openapi({ example: 4, description: 'Inherent impact score' }),
  inherentLikelihood: z
    .number()
    .nullable()
    .openapi({ example: 3, description: 'Inherent likelihood score' }),
};

const riskBaseFields = {
  tier: z.number().int().gte(0).openapi({
    example: 1,
    description: 'Risk tier (0 = enterprise, 1+ = operational)',
  }),
  status: z
    .string()
    .openapi({ example: 'Open', description: 'Current status of the risk' }),
  treatment: z.string().openapi({
    example: 'Mitigate',
    description: 'Selected treatment strategy',
  }),
};

export const RiskSchema = baseEntitySchema.extend({
  ...riskBaseFields,
  riskScore: z.object(riskScore),
  ...scheduleAndStateSchema,
  links: listLinksSchema.extend(extendedLinks),
});

export const RiskListItemSchema = baseEntitySchema
  .extend({
    ...riskBaseFields,
    riskScore: z.object(riskScore),
    links: listLinksSchema.extend(extendedLinks),
  })
  .strict();

export const RiskListSchema = z.array(RiskListItemSchema);

export const CreateRiskSchema = RiskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).strict();

export const UpdateRiskSchema = RiskSchema.partial()
  .omit({
    id: true,
    createdAt: true,
  })
  .strict();

// TODO: remove this schema (old v1 pagination).
export const RiskQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default('10'),
});

export type BaseRiskRatingSchemaResponse = z.infer<typeof RiskRatingBaseSchema>;
export type RiskRatingListResponse = z.infer<typeof RiskRatingListSchema>;
export type RiskRatingResponse = z.infer<typeof RiskRatingItemSchema>;
export type RiskListItemResponse = z.infer<typeof RiskListItemSchema>;
export type RiskResponse = z.infer<typeof RiskSchema>;
export type CreateRisk = z.infer<typeof CreateRiskSchema>;
export type UpdateRisk = z.infer<typeof UpdateRiskSchema>;
export type RiskQuery = z.infer<typeof RiskQuerySchema>;
