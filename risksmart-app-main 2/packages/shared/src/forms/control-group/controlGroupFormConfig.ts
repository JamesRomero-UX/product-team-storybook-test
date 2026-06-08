import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getControlGroupFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t('controlGroups.fields.Title'),
      columnHeader: i18n.t('controlGroups.columns.title'),
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t('fields.Description'),
      columnHeader: i18n.t('controlGroups.columns.description'),
    },
    Owner: {
      fieldId: 'Owner',
      formLabel: i18n.t('controlGroups.fields.Owner'),
      columnHeader: i18n.t('controlGroups.columns.owner_username'),
    },
  } as const satisfies FormConfig;
};
