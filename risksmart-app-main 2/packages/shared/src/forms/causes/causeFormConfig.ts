import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getCauseFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`causes.fields.Title`),
      columnHeader: i18n.t(`causes.columns.title`),
      allowAsConditionSource: true,
    },
    Significance: {
      fieldId: 'Significance',
      formLabel: i18n.t(`causes.fields.Significance`),
      columnHeader: i18n.t(`causes.columns.significance`),
      displayType: {
        displayType: 'rating',
        ratingKey: 'significance',
      },
      allowTargetConditions: true,
      allowAsConditionSource: true,
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`fields.Description`), // shared i18n
      columnHeader: i18n.t(`causes.columns.description`),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
