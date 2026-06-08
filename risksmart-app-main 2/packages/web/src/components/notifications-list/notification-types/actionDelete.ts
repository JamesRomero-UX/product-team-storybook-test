import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';
import { auditItemSearch } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item, lookupData) => {
  const actionId = item.data?.objectId ?? item.data?.actionId;
  const action = lookupData.actions?.[actionId];

  return {
    message: i18n.t('notifications.messages.actionDelete', {
      title:
        action?.SequentialId && action?.Title
          ? `${action?.Title}`
          : i18n.t('notifications.unknown'),
    }),
    url: action ? auditItemSearch(action.Id) : null,
    id: `${getFriendlyId(Parent_Type_Enum.Action, action?.SequentialId)}`,
  };
};
