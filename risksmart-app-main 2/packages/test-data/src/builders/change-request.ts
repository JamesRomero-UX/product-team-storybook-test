import { ApprovalStatus } from '@risksmart-app/domain/src/types/consts/approval-status';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildChangeRequest = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'change_request'>>
): InferInsertModel<'change_request'> => {
  const timestamp = '2024-01-15T10:00:00Z';

  return {
    Id: randomUUID(),
    OrgKey: orgKey,
    ParentId: randomUUID(),
    ChangeRequestStatus: ApprovalStatus.Pending,
    CreatedByUser: userId,
    CreatedAtTimestamp: timestamp,
    ModifiedByUser: userId,
    ModifiedAtTimestamp: timestamp,
    Comment: 'Test change request comment',
    RequestedChanges: { test: 'data' },
    Type: 'update',
    OverriddenByUser: null,
    OverriddenAtTimestamp: null,
    ActionUserId: userId,
    ...overrides,
  };
};
