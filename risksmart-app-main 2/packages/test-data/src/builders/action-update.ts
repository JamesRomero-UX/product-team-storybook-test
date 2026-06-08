import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildActionUpdate = ({
  orgKey,
  userId,
  actionId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  actionId: string;
  overrides?: Partial<InferInsertModel<'action_update'>>;
}): InferInsertModel<'action_update'> => ({
  Description: 'Some action update description',
  Title: 'Some title',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  Id: randomUUID(),
  ParentActionId: actionId,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  OrgKey: orgKey,
  ...overrides,
});
