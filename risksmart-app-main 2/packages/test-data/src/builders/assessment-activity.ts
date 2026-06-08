import {
  AssessmentActivityStatus,
  AssessmentActivityType,
} from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildAssessmentActivity = ({
  orgKey,
  userId,
  parentId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  parentId: string;
  overrides?: Partial<InferInsertModel<'assessment_activity'>>;
}): InferInsertModel<'assessment_activity'> => ({
  Id: randomUUID(),
  ActivityType: AssessmentActivityType.Task,
  ParentId: parentId,
  OrgKey: orgKey,
  Title: 'Test Assessment Activity',
  Summary: 'Test assessment activity summary',
  Status: AssessmentActivityStatus.NotStarted,
  AssignedUser: userId,
  IsRCSA: false,
  RiskId: null,
  CompletionDate: null,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  CustomAttributeData: {},
  ...overrides,
});
