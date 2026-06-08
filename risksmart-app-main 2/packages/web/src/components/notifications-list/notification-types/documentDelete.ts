import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';
import { auditItemSearch } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item, lookupData) => {
  const documentId = item.data?.objectId;
  const document = lookupData.documents?.[documentId];

  return {
    message: i18n.t('notifications.messages.documentDelete', {
      title:
        document?.SequentialId && document?.Title
          ? `${document?.Title}`
          : i18n.t('notifications.unknown'),
    }),
    url: document ? auditItemSearch(document.Id) : null,
    id: `${getFriendlyId(Parent_Type_Enum.Document, document?.SequentialId)}`,
  };
};
