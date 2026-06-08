import { AssessmentStatus } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildComplianceMonitoringAssessment = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'compliance_monitoring_assessment'>>
): Omit<
  InferInsertModel<'compliance_monitoring_assessment'>,
  'SequentialId'
> => ({
  Id: randomUUID(),
  Title: 'Test Compliance Monitoring Assessment',
  Summary: 'Test compliance monitoring assessment summary',
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  Status: AssessmentStatus.NotStarted,
  ...overrides,
});
