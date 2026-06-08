import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildChangeRequestContributor = ({
  orgKey,
  changeRequestId,
  userId,
  createdByUser,
  overrides,
}: {
  orgKey: string;
  changeRequestId: string;
  userId: string;
  createdByUser: string;
  overrides?: Partial<InferInsertModel<'change_request_contributor'>>;
}): InferInsertModel<'change_request_contributor'> => {
  const timestamp = '2024-01-15T10:00:00Z';

  return {
    Id: randomUUID(),
    OrgKey: orgKey,
    ChangeRequestId: changeRequestId,
    UserId: userId,
    CreatedAtTimestamp: timestamp,
    ModifiedAtTimestamp: timestamp,
    CreatedByUser: createdByUser,
    ModifiedByUser: createdByUser,
    ...overrides,
  };
};
