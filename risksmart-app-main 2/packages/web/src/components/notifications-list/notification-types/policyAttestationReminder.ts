import i18n from '@risksmart-app/i18n/src/i18n';

import { publicPolicyFileUrl } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item) => {
  const url = publicPolicyFileUrl(
    item.data?.parentObjectId ?? '',
    item.data?.objectId ?? ''
  );

  return {
    message: i18n.t('notifications.messages.policyAttestationReminder'),
    id: null,
    url,
  };
};
