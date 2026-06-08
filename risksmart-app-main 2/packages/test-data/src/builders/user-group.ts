import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildUserGroup = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'user_group'>>;
}): InferInsertModel<'user_group'> => ({
  Name: 'Test User Group',
  Description: 'Test user group description',
  Email: 'test-group@example.com',
  OwnerContributor: true,
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
