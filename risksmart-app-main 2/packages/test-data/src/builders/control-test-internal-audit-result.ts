import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildControlTestInternalAuditResult = (
  orgKey: string,
  userId: string,
  overrides: Partial<
    InferInsertModel<'control_test_internal_audit_result'>
  > = {}
): Omit<
  InferInsertModel<'control_test_internal_audit_result'>,
  'SequentialId'
> => ({
  Id: randomUUID(),
  Title: 'Test Control Title',
  Submitter: userId,
  Description: 'Test control description',
  ParentControlId: randomUUID(),
  TestType: '1stLine',
  DesignEffectiveness: 3,
  PerformanceEffectiveness: 3,
  OverallEffectiveness: 3,
  TestDate: '2024-01-15T10:00:00Z',
  NextTestDate: null,
  OrgKey: orgKey,
  Meta: null,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CustomAttributeData: null,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  ...overrides,
});
