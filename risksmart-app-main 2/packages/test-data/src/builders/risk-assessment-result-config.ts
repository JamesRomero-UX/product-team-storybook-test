import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildRiskAssessmentResultConfig = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'risk_assessment_result_config'>>;
}): InferInsertModel<'risk_assessment_result_config'> => ({
  Id: randomUUID(),
  OrgKey: orgKey,
  Version: 1,
  Config: {},
  IsLatest: true,
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
