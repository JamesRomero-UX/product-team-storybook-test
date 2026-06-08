import { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import { z } from 'zod';

export const createRiskAssessmentResultRequestSchema = z.object({
  RiskIds: z.array(z.string().uuid()).min(1, 'At least one RiskId is required'),
  ControlType: z.nativeEnum(RiskAssessmentResultControlType),
  Rating: z.number().int().nullable().optional(),
  Likelihood: z.number().int().nullable().optional(),
  Impact: z.number().int().nullable().optional(),
  AssessmentId: z.string().uuid().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  TestDate: z.string().nullable().optional(),
  Rationale: z.string().nullable().optional(),
  ConfigId: z.string().uuid().nullable().optional(),
});

export type CreateRiskAssessmentResultRequest = z.infer<
  typeof createRiskAssessmentResultRequestSchema
>;
