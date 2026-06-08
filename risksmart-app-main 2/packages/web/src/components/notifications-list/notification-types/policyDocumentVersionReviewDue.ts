import i18n from '@risksmart-app/i18n/src/i18n';

import { policyDetailsUrl } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item) => {
  const documentId = item.data?.objectId;

  return {
    message: i18n.t('notifications.messages.policyDocumentVersionReviewDue'),
    id: null,
    url: documentId ? policyDetailsUrl(documentId) : null,
  };
};
