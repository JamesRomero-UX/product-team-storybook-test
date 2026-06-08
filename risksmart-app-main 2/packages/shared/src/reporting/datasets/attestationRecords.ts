import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getAttestationRecords = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.AttestationRecord,
    label: i18n.format(t('attestation_other'), 'capitalize'),
    fields: {
      ...getAuditColumns(),
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      userId: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('attestations.columns.user_id'),
      },
      userFriendlyName: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('attestations.columns.user_friendly_name'),
      },
      active: {
        dataType: 'bool',
        displayType: 'commonLookup',
        i18nKey: 'yesOrNo',
        defaultLabel: t('attestations.columns.active'),
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'attestation_record_status',
        defaultLabel: t('attestations.columns.status'),
      },
      attestedAt: {
        dataType: 'date',
        displayType: 'date',
        defaultLabel: t('attestations.columns.attested_at'),
      },
      expiresAt: {
        dataType: 'date',
        displayType: 'date',
        defaultLabel: t('attestations.columns.expires_at'),
      },
    },
  }) as const satisfies SharedDataset;
