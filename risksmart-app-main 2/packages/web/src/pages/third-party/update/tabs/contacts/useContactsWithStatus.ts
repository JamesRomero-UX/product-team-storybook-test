import { useMemo } from 'react';

import type {
  ThirdPartyContactFields,
  ThirdPartyContactWithStatus,
} from './types';

type ContactStatus = 'active' | 'pending' | 'revoked';

export const getContactStatus = (
  isRevoked: boolean,
  lastSeen: string | null | undefined,
  passwordSetAt: string | null | undefined
): ContactStatus => {
  if (isRevoked) {
    return 'revoked';
  }
  if (lastSeen || passwordSetAt) {
    return 'active';
  }

  return 'pending';
};

export const mapContactWithStatus = (
  contact: ThirdPartyContactFields
): ThirdPartyContactWithStatus => {
  const lastLogin = contact.user?.LastSeen ?? null;
  const status = getContactStatus(
    contact.IsRevoked,
    lastLogin,
    contact.PasswordSetAtTimestamp ?? null
  );

  return {
    ...contact,
    lastLogin,
    status,
  };
};

export const useContactsWithStatus = (
  contacts: ThirdPartyContactFields[]
): ThirdPartyContactWithStatus[] => {
  return useMemo(() => contacts.map(mapContactWithStatus), [contacts]);
};
