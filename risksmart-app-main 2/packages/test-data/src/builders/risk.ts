import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildRisk = ({
  orgKey,
  userId,
  riskId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  riskId?: string;
  overrides?: Partial<InferInsertModel<'risk'>>;
}): InferInsertModel<'risk'> => ({
  Description: 'Some risk description',
  Title: 'Test Risk',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  Id: riskId || randomUUID(),
  Tier: 1,
  ParentRiskId: null,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  OrgKey: orgKey,
  Treatment: RiskTreatmentType.Terminate,
  ...overrides,
});
