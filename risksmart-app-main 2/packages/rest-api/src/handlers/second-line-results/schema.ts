import { RiskAssessmentResultControlTypeEnum } from 'generated/graphql';
import {
  CustomAttributeDataSchema,
  NullableStringDateSchema,
  StringDateSchema,
} from 'src/sharedSchemas';
import { z } from 'zod';

import { TestResultSharedSchema } from '../test-results/schema';

export const UpdateRiskSecondLineResultSchema = z
  .object({
    ComplianceMonitoringAssessmentId: z.string().uuid(),
    Id: z.string().uuid(),
    Rating: z.number().int({ message: 'Required' }).nullable(),
    Impact: z.number().int({ message: 'Required' }).nullable(),
    Likelihood: z.number().int({ message: 'Required' }).nullable(),
    Rationale: z.string().nullable(),
    TestDate: NullableStringDateSchema,
  })
  .and(CustomAttributeDataSchema);

export const InsertRiskSecondLineResultSchema = z
  .object({
    ComplianceMonitoringAssessmentId: z.string().uuid(),
    RiskIds: z.array(z.string().uuid()),
    Rating: z.number().int({ message: 'Required' }).nullable(),
    Impact: z.number().int({ message: 'Required' }).nullable(),
    Likelihood: z.number().int({ message: 'Required' }).nullable(),
    ControlType: z.nativeEnum(RiskAssessmentResultControlTypeEnum),
    Rationale: z.string().optional(),
    TestDate: NullableStringDateSchema,
  })
  .and(CustomAttributeDataSchema);

export const ObligationSecondLineResultSchema = z
  .object({
    ComplianceMonitoringAssessmentId: z.string().uuid(),
    ObligationIds: z.array(z.string().uuid()),
    Rating: z.number().int({ message: 'Required' }),
    Rationale: z.string().optional(),
    TestDate: NullableStringDateSchema,
  })
  .and(CustomAttributeDataSchema);

export const DocumentSecondLineResultSchema = z
  .object({
    ComplianceMonitoringAssessmentId: z.string().uuid(),
    DocumentIds: z.array(z.string().uuid()),
    Rating: z.number().int({ message: 'Required' }),
    Rationale: z.string().optional(),
    TestDate: NullableStringDateSchema,
  })
  .and(CustomAttributeDataSchema);

export const ControlTestSecondLineResultSchema = z
  .object({
    ComplianceMonitoringAssessmentId: z.string().uuid(),
    ControlIds: z.array(z.string().uuid()),
  })
  .and(TestResultSharedSchema)
  .and(CustomAttributeDataSchema);

export const ImpactRatingSecondLineResultSchema = z
  .object({
    ComplianceMonitoringAssessmentId: z.string().uuid(),
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

export const UpdateControlTestSecondLineResultSchema = z.object({
  object: z
    .object({
      Id: z.string().uuid(),
      OriginalTimestamp: StringDateSchema,
      ParentControlId: z.string().uuid(),
    })
    .and(TestResultSharedSchema),
});
