import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getAssessmentActivityFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`assessmentActivities.fields.Title`),
      columnHeader: i18n.t(`assessmentActivities.columns.Title`),
      allowAsConditionSource: true,
    },
    ActivityType: {
      fieldId: 'ActivityType',
      formLabel: i18n.t(`assessmentActivities.fields.ActivityType`),
      columnHeader: i18n.t(`assessmentActivities.columns.Type`),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'assessmentActivities.type',
      },
    },
    Summary: {
      fieldId: 'Summary',
      formLabel: i18n.t(`assessmentActivities.fields.Summary`),
      columnHeader: i18n.t(`assessmentActivities.columns.Summary`),
      allowTargetConditions: true,
    },
    Status: {
      fieldId: 'Status',
      formLabel: i18n.t(`assessmentActivities.fields.Status`),
      columnHeader: i18n.t(`assessmentActivities.columns.Status`),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'assessmentActivities.status',
      },
    },
    AssignedUser: {
      fieldId: 'AssignedUser',
      formLabel: i18n.t(`assessmentActivities.fields.AssignedUser`),
      columnHeader: i18n.t(`assessmentActivities.columns.AssignedUser`),
      allowAsConditionSource: true,
      allowTargetConditions: true,
      displayType: {
        displayType: 'users',
        multiple: false,
      },
    },
    CompletionDate: {
      fieldId: 'CompletionDate',
      formLabel: i18n.t(`assessmentActivities.fields.CompletionDate`),
      columnHeader: i18n.t(`assessmentActivities.columns.CompletionDate`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`assessmentActivities.fields.NewFiles`),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
