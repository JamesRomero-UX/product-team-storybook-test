import { AssessmentStatus } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildAssessment = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'assessment'>>
): InferInsertModel<'assessment'> => ({
  Id: randomUUID(),
  Title: 'Test Assessment',
  Summary: 'Test assessment summary',
  TargetCompletionDate: null,
  ActualCompletionDate: null,
  StartDate: null,
  NextTestDate: null,
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  CompletedByUser: null,
  OriginatingItemId: null,
  CustomAttributeData: {},
  Status: AssessmentStatus.NotStarted,
  Outcome: null,
  ...overrides,
});
