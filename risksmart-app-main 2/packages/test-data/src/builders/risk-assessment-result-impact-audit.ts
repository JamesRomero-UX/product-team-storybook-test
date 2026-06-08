import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildRiskAssessmentResultImpactAudit = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'risk_assessment_result_impact_audit'>>
): InferInsertModel<'risk_assessment_result_impact_audit'> => ({
  Id: randomUUID(),
  RiskAssessmentResultId: randomUUID(),
  OrgKey: orgKey,
  Label: 'Test Impact',
  Value: 1,
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  Action: 'INSERT',
  ...overrides,
});
