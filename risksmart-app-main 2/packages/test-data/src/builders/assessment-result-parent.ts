import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildAssessmentResultParent = ({
  orgKey,
  userId,
  parentId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  parentId: string;
  overrides?: Partial<InferInsertModel<'assessment_result_parent'>>;
}): InferInsertModel<'assessment_result_parent'> => ({
  Id: randomUUID(),
  ResultType: ParentTypes.DocumentAssessmentResult,
  ParentId: parentId,
  ParentType: ParentTypes.Assessment,
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  ...overrides,
});
