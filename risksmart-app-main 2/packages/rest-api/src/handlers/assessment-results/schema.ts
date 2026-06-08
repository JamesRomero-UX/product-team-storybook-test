import { RiskAssessmentResultControlTypeEnum } from 'generated/graphql';
import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
  StringDateSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

import { TestResultSharedSchema } from '../test-results/schema';

const RiskAssessmentResultImpactsSchema = z
  .array(
    z.object({
      Label: z.string().min(1, { message: 'Required' }),
      Value: z.number().int({ message: 'Required' }),
    })
  )
  .min(1, { message: 'At least one impact is required' });

export type RiskAssessmentResultImpact = z.infer<
  typeof RiskAssessmentResultImpactsSchema
>[number];

const UpdateRiskAssessmentResultBaseSchema = z.object({
  AssessmentId: z.string().uuid().nullable().optional(),
  Id: z.string().uuid(),
  Rating: z.number().int({ message: 'Required' }).nullable(),
  Likelihood: z.number().int({ message: 'Required' }).nullable(),
  Rationale: z.string().nullish(),
  TestDate: NullableStringDateSchema,
});

const UpdateRiskAssessmentResultWithImpactSchema =
  UpdateRiskAssessmentResultBaseSchema.extend({
    Impact: z.number().int({ message: 'Required' }).nullable(),
    Impacts: z.undefined().or(z.null()),
  }).and(CustomAttributeDataSchema);

const UpdateRiskAssessmentResultWithImpactsSchema =
  UpdateRiskAssessmentResultBaseSchema.extend({
    Impact: z.undefined().or(z.null()),
    Impacts: RiskAssessmentResultImpactsSchema,
  }).and(CustomAttributeDataSchema);

export const UpdateRiskAssessmentResultSchema = z.union([
  UpdateRiskAssessmentResultWithImpactSchema,
  UpdateRiskAssessmentResultWithImpactsSchema,
]);

export type UpdateRiskAssessmentResultInput = z.infer<
  typeof UpdateRiskAssessmentResultSchema
>;

export type UpdateRiskAssessmentResultWithImpactInput = z.infer<
  typeof UpdateRiskAssessmentResultWithImpactSchema
>;

export type UpdateRiskAssessmentResultWithImpactsInput = z.infer<
  typeof UpdateRiskAssessmentResultWithImpactsSchema
>;

const InsertRiskAssessmentResultBaseSchema = z.object({
  AssessmentId: z.string().uuid().nullable().optional(),
  RiskIds: z.array(z.string().uuid()),
  Rating: z.number().int({ message: 'Required' }).nullable(),
  Likelihood: z.number().int({ message: 'Required' }).nullable(),
  ControlType: z.nativeEnum(RiskAssessmentResultControlTypeEnum),
  Rationale: z.string().nullish(),
  TestDate: NullableStringDateSchema,
});

const InsertRiskAssessmentResultWithImpactSchema =
  InsertRiskAssessmentResultBaseSchema.extend({
    Impact: z.number().int({ message: 'Required' }).nullable(),
    Impacts: z.undefined().or(z.null()),
  }).and(CustomAttributeDataSchema);

const InsertRiskAssessmentResultWithImpactsSchema =
  InsertRiskAssessmentResultBaseSchema.extend({
    Impact: z.undefined().or(z.null()),
    Impacts: RiskAssessmentResultImpactsSchema,
  }).and(CustomAttributeDataSchema);

export const InsertRiskAssessmentResultSchema = z.union([
  InsertRiskAssessmentResultWithImpactSchema,
  InsertRiskAssessmentResultWithImpactsSchema,
]);

export type InsertRiskAssessmentResultInput = z.infer<
  typeof InsertRiskAssessmentResultSchema
>;

export type InsertRiskAssessmentResultWithAssessmentInput =
  InsertRiskAssessmentResultInput & {
    AssessmentId: string;
  };

export type InsertRiskAssessmentResultWithImpactInput = z.infer<
  typeof InsertRiskAssessmentResultWithImpactSchema
>;

export type InsertRiskAssessmentResultWithImpactsInput = z.infer<
  typeof InsertRiskAssessmentResultWithImpactsSchema
>;

export const ObligationAssessmentResultSchema = z
  .object({
    AssessmentId: z.string().uuid().nullable().optional(),
    ObligationIds: z.array(z.string().uuid()),
    Rating: z.number().int({ message: 'Required' }),
    Rationale: z.string().nullish(),
    TestDate: NullableStringDateSchema,
  })
  .and(CustomAttributeDataSchema);

export const DocumentAssessmentResultSchema = z
  .object({
    AssessmentId: z.string().uuid().nullable().optional(),
    DocumentIds: z.array(z.string().uuid()),
    Rating: z.number().int({ message: 'Required' }),
    Rationale: z.string().nullish(),
    TestDate: NullableStringDateSchema,
  })
  .and(CustomAttributeDataSchema);

export const ControlTestAssessmentResultSchema = z
  .object({
    AssessmentId: z.string().uuid().nullable().optional(),
    ControlIds: z.array(z.string().uuid()),
  })
  .and(TestResultSharedSchema)
  .and(CustomAttributeDataSchema);

export const ImpactRatingAssessmentResultSchema = z
  .object({
    AssessmentId: z.string().uuid().nullable().optional(),
    Ratings: z.array(
      z.object({
        ImpactId: z
          .string({ invalid_type_error: 'Required' })
          .uuid({ message: 'Required' }),
        Rating: z
          .number({ invalid_type_error: 'Required' })
          .int({ message: 'Required' })
          .min(0),
      })
    ),
    RatedItemId: z
      .string({ invalid_type_error: 'Required' })
      .uuid({ message: 'Required' }),
    CompletedBy: z
      .string({ invalid_type_error: 'Required' })
      .nullish()
      .optional(),
    TestDate: StringDateSchema,
    Likelihood: z.number().nullish(),
  })
  .and(CustomAttributeDataSchema);
