import { AppetiteStatus } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildAppetiteParent = ({
  orgKey,
  userId,
  appetiteId,
  parentId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  appetiteId: string;
  parentId: string;
  overrides?: Partial<InferInsertModel<'appetite_parent'>>;
}): InferInsertModel<'appetite_parent'> => ({
  Id: appetiteId,
  ParentId: parentId,
  Status: AppetiteStatus.Active,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: undefined,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: undefined,
  ...overrides,
});
