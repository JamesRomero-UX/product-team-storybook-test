import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildRiskAssessmentResultConfigAudit = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'risk_assessment_result_config_audit'>>
): InferInsertModel<'risk_assessment_result_config_audit'> => ({
  Id: randomUUID(),
  OrgKey: orgKey,
  Version: 1,
  Config: null,
  IsLatest: true,
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  Action: 'INSERT',
  ...overrides,
});
