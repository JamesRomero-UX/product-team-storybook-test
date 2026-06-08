import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';
import { controlDetailsUrl } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item, lookupData) => {
  const controlId = item.data?.objectId ?? item.data?.controlId;
  const control = lookupData.controls?.[controlId];

  return {
    message: i18n.t('notifications.messages.controlTestOverdue', {
      title:
        control?.SequentialId && control?.Title
          ? `${control?.Title}`
          : i18n.t('notifications.unknown'),
    }),
    url: control ? controlDetailsUrl(control.Id) : null,
    id: `${getFriendlyId(Parent_Type_Enum.Control, control?.SequentialId)}`,
  };
};
