import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getConsequenceFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`consequences.fields.Title`),
      columnHeader: i18n.t(`consequences.columns.title`),
      allowAsConditionSource: true,
    },
    Type: {
      fieldId: 'Type',
      formLabel: i18n.t(`consequences.fields.Type`),
      columnHeader: i18n.t(`consequences.columns.type`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'consequences.types',
      },
    },
    Criticality: {
      fieldId: 'Criticality',
      formLabel: i18n.t(`consequences.fields.Criticality`),
      columnHeader: i18n.t(`consequences.columns.criticality`),
      displayType: {
        displayType: 'rating',
        ratingKey: 'criticality',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    CostType: {
      fieldId: 'CostType',
      formLabel: i18n.t(`consequences.fields.CostType`),
      columnHeader: i18n.t(`consequences.columns.costType`),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'consequences.costType',
      },
    },
    CostValue: {
      fieldId: 'CostValue',
      formLabel: i18n.t(`consequences.fields.CostValue`),
      columnHeader: i18n.t(`consequences.columns.costValue`),
      allowAsConditionSource: true,
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`consequences.fields.Description`),
      columnHeader: i18n.t(`consequences.columns.description`),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
