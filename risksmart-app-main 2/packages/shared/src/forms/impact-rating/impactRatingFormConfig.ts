import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getImpactRatingFormConfig = () => {
  return {
    ImpactId: {
      fieldId: 'ImpactId',
      formLabel: i18n.t('impactRatings.fields.Impact'),
    },
    RatedItemId: {
      fieldId: 'RatedItemId',
      formLabel: i18n.t('impactRatings.fields.Risk'),
    },
    CompletedBy: {
      fieldId: 'CompletedBy',
      formLabel: i18n.t('impactRatings.fields.CompletedBy'),
    },
    TestDate: {
      fieldId: 'TestDate',
      formLabel: i18n.t('impactRatings.fields.TestDate'),
      displayType: { displayType: 'date' },
    },
    Likelihood: {
      fieldId: 'Likelihood',
      formLabel: i18n.t('impactRatings.fields.Likelihood'),
      displayType: { displayType: 'rating', ratingKey: 'likelihood' },
    },
    Rating: {
      fieldId: 'Rating',
      formLabel: i18n.t('impactRatings.fields.Rating'),
      displayType: { displayType: 'rating', ratingKey: 'impact' },
    },
  } as const satisfies FormConfig;
};
