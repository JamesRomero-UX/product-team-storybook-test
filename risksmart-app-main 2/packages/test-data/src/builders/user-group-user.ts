import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildUserGroupUser = ({
  orgKey,
  userId,
  userGroupId,
  memberUserId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  userGroupId: string;
  memberUserId: string;
  overrides?: Partial<InferInsertModel<'user_group_user'>>;
}): InferInsertModel<'user_group_user'> => ({
  UserGroupId: userGroupId,
  UserId: memberUserId,
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
