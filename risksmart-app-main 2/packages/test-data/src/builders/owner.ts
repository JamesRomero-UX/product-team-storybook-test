import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildOwner = ({
  orgKey,
  parentId,
  userId,
  createdByUser,
  overrides,
}: {
  orgKey: string;
  parentId: string;
  userId: string;
  createdByUser: string;
  overrides?: Partial<InferInsertModel<'owner'>>;
}): InferInsertModel<'owner'> => {
  const timestamp = '2024-01-15T10:00:00Z';

  return {
    ParentId: parentId,
    UserId: userId,
    OrgKey: orgKey,
    CreatedByUser: createdByUser,
    ModifiedByUser: createdByUser,
    CreatedAtTimestamp: timestamp,
    ModifiedAtTimestamp: timestamp,
    ...overrides,
  };
};
