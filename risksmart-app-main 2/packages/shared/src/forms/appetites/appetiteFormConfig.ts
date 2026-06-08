import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getAppetiteFormConfig = (postureFeatureEnabled: boolean) => {
  return {
    AppetiteType: {
      fieldId: 'AppetiteType',
      formLabel: i18n.t(`appetites.columns.appetiteType`),
      columnHeader: i18n.t(`appetites.columns.appetiteType`),
    },
    Statement: {
      fieldId: 'Statement',
      formLabel: i18n.t(`appetites.columns.statement`),
      columnHeader: i18n.t(`appetites.columns.statement`),
      allowTargetConditions: true,
    },
    LowerAppetite: {
      fieldId: 'LowerAppetite',
      formLabel: i18n.t(`appetites.columns.lowerAppetite`),
      columnHeader: i18n.t(`appetites.columns.lowerAppetite`),
      displayType: { displayType: 'rating', ratingKey: 'risk_appetite' },
      allowAsConditionSource: true,
    },
    UpperAppetite: {
      fieldId: 'UpperAppetite',
      // This mirrors the current behaviour of the UI, however could lead to unusual behaviour is a user renamed the feature, then changes the posture setting.
      formLabel: postureFeatureEnabled
        ? i18n.t(`appetites.columns.posture`)
        : i18n.t(`appetites.columns.upperAppetite`),
      columnHeader: postureFeatureEnabled
        ? i18n.t(`appetites.columns.posture`)
        : i18n.t(`appetites.columns.upperAppetite`),
      displayType: { displayType: 'rating', ratingKey: 'risk_appetite' },
      allowAsConditionSource: true,
    },
    LikelihoodAppetite: {
      fieldId: 'LikelihoodAppetite',
      formLabel: i18n.t(`appetites.columns.likelihoodAppetite`),
      columnHeader: i18n.t(`appetites.columns.likelihoodAppetite`),
      displayType: { displayType: 'rating', ratingKey: 'likelihood_appetite' },
    },
    ImpactId: {
      fieldId: 'ImpactId',
      formLabel: i18n.format(i18n.t('impact'), 'capitalize'),
      columnHeader: i18n.format(i18n.t('impact'), 'capitalize'),
    },
    ImpactAppetite: {
      fieldId: 'ImpactAppetite',
      formLabel: i18n.t('impactAppetite'),
      columnHeader: i18n.t('impactAppetite'),
      displayType: { displayType: 'rating', ratingKey: 'impact_appetite' },
    },
    EffectiveDate: {
      fieldId: 'EffectiveDate',
      formLabel: i18n.t(`appetites.columns.effectiveDate`),
      columnHeader: i18n.t(`appetites.columns.effectiveDate`),
      displayType: { displayType: 'date' },
      allowTargetConditions: true,
      allowAsConditionSource: true,
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`fields.newFiles`),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
