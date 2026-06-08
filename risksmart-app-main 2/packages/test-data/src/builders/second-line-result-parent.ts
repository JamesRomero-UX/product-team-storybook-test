import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildSecondLineResultParent = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'second_line_result_parent'>>
): InferInsertModel<'second_line_result_parent'> => ({
  Id: randomUUID(),
  ParentId: randomUUID(),
  ResultType: ParentTypes.RiskControlledSecondLineResult,
  ParentType: ParentTypes.ComplianceMonitoringAssessment,
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ...overrides,
});
