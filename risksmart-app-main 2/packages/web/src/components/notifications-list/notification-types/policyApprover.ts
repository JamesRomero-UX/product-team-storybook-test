import i18n from '@risksmart-app/i18n/src/i18n';

import { policyFilesUrl } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item, lookupData) => {
  const policyVersionId = item.data?.objectId;
  const documentFile = lookupData?.documentFiles?.[policyVersionId];

  return {
    message: documentFile?.ParentDocumentId
      ? i18n.t('notifications.messages.policyDocumentVersionApproval')
      : `${i18n.t(
          'notifications.messages.policyDocumentVersionApproval'
        )}:${i18n.t('notifications.unknown')}`,
    id: null,
    url: documentFile ? policyFilesUrl(documentFile.ParentDocumentId) : null,
  };
};
