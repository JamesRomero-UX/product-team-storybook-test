import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getIssueUpdateFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`fields.Title`),
      // currently issue updates using action updates column header
      columnHeader: i18n.t(`actionUpdates.columns.title`),
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`fields.Description`),
      // currently issue updates using action updates column header
      columnHeader: i18n.t(`actionUpdates.columns.description`),
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`fields.newFiles`),
    },
  } as const satisfies FormConfig;
};
