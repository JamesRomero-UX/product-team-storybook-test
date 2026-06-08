import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { getFriendlyId } from '@/utils/friendlyId';
import { riskDetailsUrl } from '@/utils/urls';

import type { GetItem } from './types';

export const getItem: GetItem = (item, lookupData) => {
  const riskId = item.data?.objectId ?? item.data?.riskId;
  const risk = lookupData.risks?.[riskId];

  return {
    message: i18n.t('notifications.messages.riskAssessmentDue', {
      title:
        risk?.SequentialId && risk?.Title
          ? `${risk?.Title}`
          : i18n.t('notifications.unknown'),
    }),
    id: `${getFriendlyId(Parent_Type_Enum.Risk, risk?.SequentialId)}`,
    url: risk ? riskDetailsUrl(risk.Id) : null,
  };
};
