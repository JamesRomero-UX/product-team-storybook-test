import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getRiskFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`risks.fields.title`),
      columnHeader: i18n.t(`risks.columns.risk_name`),
      allowAsConditionSource: true,
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`risks.fields.description`),
      columnHeader: i18n.t(`risks.columns.risk_description`),
      allowTargetConditions: true,
    },
    Tier: {
      fieldId: 'Tier',
      formLabel: i18n.t(`risks.fields.tier`),
      columnHeader: i18n.t(`risks.columns.risk_tier`),
      allowAsConditionSource: true,
      displayType: { displayType: 'commonLookup', i18nKey: 'tiers' },
    },
    ParentRiskId: {
      fieldId: 'ParentRiskId',
      formLabel: i18n.t(`risks.fields.parent`),
      columnHeader: i18n.t(`risks.columns.parent_risk`),
    },
    Treatment: {
      fieldId: 'Treatment',
      formLabel: i18n.t(`risks.fields.treatment`),
      columnHeader: i18n.t(`risks.columns.risk_treatment`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: { displayType: 'commonLookup', i18nKey: 'treatments' },
    },
    Status: {
      fieldId: 'Status',
      formLabel: i18n.t(`risks.fields.status`),
      columnHeader: i18n.t(`risks.columns.risk_status`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'statuses',
      },
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t(`fields.Owner`),
      columnHeader: i18n.t(`columns.owners`),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'users',
        multiple: true,
      },
    },
    Contributors: {
      fieldId: 'Contributors',
      formLabel: i18n.t(`fields.Contributor`),
      columnHeader: i18n.t(`columns.contributors`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: {
        displayType: 'users',
        multiple: true,
      },
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t(`fields.Tags`),
      columnHeader: i18n.t(`columns.tags`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
      displayType: {
        displayType: 'tags',
      },
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t(`fields.Departments`),
      columnHeader: i18n.t(`columns.departments`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
      displayType: {
        displayType: 'departments',
      },
    },
  } as const satisfies FormConfig;
};
