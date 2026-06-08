import { UserStatus } from '@risksmart-app/domain/src/types/consts/index';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildOrganisationUser = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'organisationuser'>>;
}): InferInsertModel<'organisationuser'> => {
  const timestamp = '2024-01-15T10:00:00Z';

  return {
    OrgKey: orgKey,
    User_Id: userId,
    RoleKey: 'RiskManager',
    LastSeen: timestamp,
    CreatedAtTimestamp: timestamp,
    CreatedByUser: userId,
    ModifiedByUser: userId,
    ModifiedAtTimestamp: timestamp,
    Status: UserStatus.Active,
    AuthConnection: null,
    AuthConnection_Id: null,
    External_Id: null,
    ...overrides,
  };
};
