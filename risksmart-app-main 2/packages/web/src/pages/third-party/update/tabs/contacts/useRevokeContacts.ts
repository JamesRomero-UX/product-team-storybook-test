import type { FetchResult } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ThirdPartyContactWithStatus } from './types';

type RevokeContactsMutationResult = FetchResult<unknown>;

export interface UseRevokeContactsParams {
  selectedContacts: ThirdPartyContactWithStatus[];
  revokeContacts: (options: {
    variables: { ContactIds: string[] };
  }) => Promise<RevokeContactsMutationResult>;
  addNotification: (notification: {
    type: 'success' | 'error';
    content: string;
  }) => void;
  refetchContacts: () => Promise<unknown>;
  onSuccess?: () => void;
}

export interface UseRevokeContactsResult {
  revocableContacts: ThirdPartyContactWithStatus[];
  handleRevokeAccess: () => Promise<void>;
}

export const filterRevocableContacts = (
  contacts: ThirdPartyContactWithStatus[]
): ThirdPartyContactWithStatus[] => {
  return contacts.filter((c) => c.status !== 'revoked');
};

export const useRevokeContacts = ({
  selectedContacts,
  revokeContacts,
  addNotification,
  refetchContacts,
  onSuccess,
}: UseRevokeContactsParams): UseRevokeContactsResult => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts',
  });
  const revocableContacts = useMemo(
    () => filterRevocableContacts(selectedContacts),
    [selectedContacts]
  );

  const handleRevokeAccess = useCallback(async () => {
    if (!revocableContacts.length) {
      return;
    }

    try {
      const contactIds = revocableContacts.map((c) => c.Id);
      await revokeContacts({
        variables: {
          ContactIds: contactIds,
        },
      });

      // All-or-nothing: if we get here, all contacts were successfully revoked
      addNotification({
        type: 'success',
        content:
          revocableContacts.length === 1
            ? t('revoke_access_success')
            : t('revoke_access_success_multiple', {
                count: revocableContacts.length,
              }),
      });

      onSuccess?.();
      await refetchContacts();
    } catch (_error) {
      // All-or-nothing: if any contact fails, none are revoked
      addNotification({
        type: 'error',
        content: t('revoke_access_error'),
      });
    }
  }, [
    revocableContacts,
    revokeContacts,
    addNotification,
    t,
    refetchContacts,
    onSuccess,
  ]);

  return {
    revocableContacts,
    handleRevokeAccess,
  };
};
