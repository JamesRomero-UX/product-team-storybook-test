import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getImpactFormConfig = () => {
  return {
    Name: {
      fieldId: 'Name',
      formLabel: i18n.t(`impacts.fields.Name`),
      columnHeader: i18n.t(`impacts.columns.Name`),
    },
    Rationale: {
      fieldId: 'Rationale',
      formLabel: i18n.t(`impacts.fields.Rationale`),
      columnHeader: i18n.t(`impacts.columns.Rationale`),
    },
    RatingGuidance: {
      fieldId: 'RatingGuidance',
      formLabel: i18n.t(`impacts.fields.RatingGuidance`),
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t(`fields.Owner`),
      columnHeader: i18n.t(`columns.owners`),
    },
    LikelihoodAppetite: {
      fieldId: 'LikelihoodAppetite',
      formLabel: i18n.t(`impacts.fields.LikelihoodAppetite`),
      displayType: {
        displayType: 'rating',
        ratingKey: 'likelihood_appetite',
      },
    },
  } as const satisfies FormConfig;
};
