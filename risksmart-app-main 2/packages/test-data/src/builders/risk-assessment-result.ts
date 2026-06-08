import { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildRiskAssessmentResult = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'risk_assessment_result'>>;
}): InferInsertModel<'risk_assessment_result'> => ({
  ControlType: RiskAssessmentResultControlType.Uncontrolled,
  Likelihood: 3,
  Impact: 4,
  Rating: 12,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  CustomAttributeData: {},
  Rationale: 'Test risk rationale',
  TestDate: '2024-01-15T10:00:00Z',
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  RatingType: 'rating',
  ...overrides,
});
