import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';
import { indicatorDetailsUrl } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item, lookupData) => {
  const indicatorId = item.data?.objectId ?? item.data?.indicatorId;
  const indicator = lookupData.indicators?.[indicatorId];

  return {
    message: i18n.t('notifications.messages.indicatorDue', {
      title:
        indicator?.SequentialId && indicator?.Title
          ? `${indicator?.Title}`
          : i18n.t('notifications.unknown'),
    }),
    url: indicator ? indicatorDetailsUrl(indicator.Id) : null,
    id: `${getFriendlyId(Parent_Type_Enum.Indicator, indicator?.SequentialId)}`,
  };
};
