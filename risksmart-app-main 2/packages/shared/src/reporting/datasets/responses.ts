import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getResponses = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.ThirdPartyResponse,
    label: i18n.format(t('response_other'), 'capitalize'),
    fields: {
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'third_party_response_status',
        defaultLabel: t('third_party_responses.columns.status'),
      },
      userEmail: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('questionnaire_invite.columns.userEmail'),
      },
      userId: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('questionnaire_invite.columns.userId'),
      },
      startDate: {
        dataType: 'date',
        displayType: 'date',
        defaultLabel: t('third_party_responses.columns.startDate'),
      },
      expiresAt: {
        dataType: 'date',
        displayType: 'date',
        defaultLabel: t('third_party_responses.columns.expireBy'),
      },
      recallReason: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('third_party_responses.columns.recallReason'),
      },
      ...getAuditColumns(),
    },
  }) as const satisfies SharedDataset;
