import { t } from 'i18next';

import type { SharedFields } from './types';

export const getAuditColumns = () =>
  ({
    createdAtTimestamp: {
      dataType: 'date',
      displayType: 'date',
      defaultLabel: t('columns.created_on'),
    },
    modifiedAtTimestamp: {
      dataType: 'date',
      displayType: 'date',
      defaultLabel: t('columns.updated_on'),
    },
    createdById: {
      dataType: 'text',
      displayType: 'text',
      defaultLabel: t('columns.created_by_id'),
    },
    modifiedById: {
      dataType: 'text',
      displayType: 'text',
      defaultLabel: t('columns.updated_by_id'),
    },
    createdByFriendlyName: {
      dataType: 'text',
      displayType: 'text',
      defaultLabel: t('columns.updated_by_username'),
    },
    modifiedByFriendlyName: {
      dataType: 'text',
      displayType: 'text',
      defaultLabel: t('columns.created_by_username'),
    },
  }) satisfies SharedFields;

export const getOwnersColumns = () =>
  ({
    owners: {
      dataType: 'textArray',
      defaultLabel: t('columns.owners'),
      displayType: 'badgeList',
    },
  }) satisfies SharedFields;
