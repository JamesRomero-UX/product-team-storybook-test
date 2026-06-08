import type { QueryConfig } from '../db';

export const getThirdPartyContactsQueryConfig = {
  columns: {
    Id: true,
    ThirdPartyId: true,
    Email: true,
    Name: true,
    JobTitle: true,
    IsRevoked: true,
    PasswordSetAtTimestamp: true,
  },
  with: {
    user: {
      columns: {
        LastSeen: true,
      },
    },
  },
} as const satisfies QueryConfig<'third_party_contact'>;

export const getThirdPartyContactByIdQueryConfig = {
  columns: {
    Id: true,
    ThirdPartyId: true,
    Email: true,
    Name: true,
    JobTitle: true,
    IsRevoked: true,
  },
} as const satisfies QueryConfig<'third_party_contact'>;
