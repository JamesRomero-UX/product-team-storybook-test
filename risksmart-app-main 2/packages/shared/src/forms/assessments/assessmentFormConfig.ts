import i18n from '@risksmart-app/i18n/src/i18n';
import type { KeyPrefix } from 'i18next';

import type { FormConfig } from '../types';
type RatingKeys = KeyPrefix<'ratings'>;

export const getAssessmentFormConfig = (
  taxonomyKey:
    | 'assessments'
    | 'complianceMonitoringAssessment'
    | 'internalAuditReports',
  outcomeRatingKey: RatingKeys
) => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`${taxonomyKey}.fields.Title`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.Title`),
      allowAsConditionSource: true,
    },
    Summary: {
      fieldId: 'Summary',
      formLabel: i18n.t(`${taxonomyKey}.fields.Summary`),
      allowTargetConditions: true,
    },
    CompletedByUser: {
      fieldId: 'CompletedByUser',
      formLabel: i18n.t(`${taxonomyKey}.fields.CompletedBy`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.CompletionBy`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
      displayType: {
        displayType: 'users',
        multiple: false,
      },
    },
    StartDate: {
      fieldId: 'StartDate',
      formLabel: i18n.t(`${taxonomyKey}.fields.StartDate`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.StartDate`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    TargetCompletionDate: {
      fieldId: 'TargetCompletionDate',
      formLabel: i18n.t(`${taxonomyKey}.fields.TargetCompletionDate`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.TargetCompletionDate`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    ActualCompletionDate: {
      fieldId: 'ActualCompletionDate',
      formLabel: i18n.t(`${taxonomyKey}.fields.ActualCompletionDate`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.CompletionDate`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    NextTestDate: {
      fieldId: 'NextTestDate',
      formLabel: i18n.t(`${taxonomyKey}.fields.NextTestDate`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.NextTestDate`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t(`fields.Owner`),
      columnHeader: i18n.t(`columns.owners`),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
    },
    Status: {
      fieldId: 'Status',
      formLabel: i18n.t(`${taxonomyKey}.fields.Status`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.Status`),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: `${taxonomyKey}.status`,
      },
    },
    Outcome: {
      fieldId: 'Outcome',
      formLabel: i18n.t(`${taxonomyKey}.fields.Outcome`),
      columnHeader: i18n.t(`${taxonomyKey}.columns.Outcome`),
      displayType: { displayType: 'rating', ratingKey: outcomeRatingKey },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    Contributors: {
      fieldId: 'Contributors',
      formLabel: i18n.t(`fields.Contributor`),
      columnHeader: i18n.t(`columns.contributors`),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t(`fields.Tags`),
      columnHeader: i18n.t(`columns.tags`),
      displayType: {
        displayType: 'tags',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t(`fields.Departments`),
      columnHeader: i18n.t(`columns.departments`),
      displayType: {
        displayType: 'departments',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
