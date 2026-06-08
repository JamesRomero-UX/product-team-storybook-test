import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildThirdPartyContact = ({
  orgKey,
  userId,
  thirdPartyId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  thirdPartyId: string;
  overrides?: Partial<InferInsertModel<'third_party_contact'>>;
}): InferInsertModel<'third_party_contact'> => ({
  Id: randomUUID(),
  ThirdPartyId: thirdPartyId,
  Email: `contact-${randomUUID().slice(0, 8)}@test.com`,
  Name: 'Test Contact',
  JobTitle: 'Manager',
  IsRevoked: false,
  PasswordSetAtTimestamp: null,
  UserId: null,
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  ...overrides,
});
