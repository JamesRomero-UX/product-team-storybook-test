import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getObligationImpactFormConfig = () => {
  return {
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t('impacts.fields.Description'),
    },
    ImpactRating: {
      fieldId: 'ImpactRating',
      formLabel: i18n.t('impacts.fields.ImpactRating'),
      displayType: {
        displayType: 'rating',
        ratingKey: 'impact',
      },
      allowAsConditionSource: true,
    },
  } as const satisfies FormConfig;
};
