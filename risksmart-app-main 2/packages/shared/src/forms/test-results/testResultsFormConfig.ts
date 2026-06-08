import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getTestResultFormConfig = () => {
  return {
    ParentControlIds: {
      fieldId: 'ParentControlIds',
      formLabel: i18n.t(`control`),
      columnHeader: i18n.t(`testResults.columns.parent`),
    },
    TestType: {
      fieldId: 'TestType',
      formLabel: i18n.t(`testType`),
      columnHeader: i18n.t(`testResults.columns.test_type`),
    },
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`titleField`),
      columnHeader: i18n.t(`testResults.columns.title`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
    },
    DesignEffectiveness: {
      fieldId: 'DesignEffectiveness',
      formLabel: i18n.t(`designEffectiveness`),
      columnHeader: i18n.t(`testResults.columns.design_effectiveness`),
      displayType: {
        displayType: 'rating',
        ratingKey: 'design_effectiveness',
      },
      allowTargetConditions: true,
      allowAsConditionSource: true,
    },
    PerformanceEffectiveness: {
      fieldId: 'PerformanceEffectiveness',
      formLabel: i18n.t(`performanceEffectiveness`),
      columnHeader: i18n.t(`testResults.columns.performance_effectiveness`),
      displayType: {
        displayType: 'rating',
        ratingKey: 'performance_effectiveness',
      },
      allowTargetConditions: true,
      allowAsConditionSource: true,
    },
    OverallEffectiveness: {
      fieldId: 'OverallEffectiveness',
      formLabel: i18n.t(`controlTestResult`),
      columnHeader: i18n.t(`testResults.columns.overall_effectiveness`),
      displayType: {
        displayType: 'rating',
        ratingKey: 'effectiveness',
      },
      allowTargetConditions: true,
      allowAsConditionSource: true,
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`controlTestDetails`),
      columnHeader: i18n.t(`columns.description`),
      allowTargetConditions: true,
    },
    Submitter: {
      fieldId: 'Submitter',
      formLabel: i18n.t(`performedBy`),
      columnHeader: i18n.t(`testResults.columns.submitter`),
      displayType: { displayType: 'users', multiple: false },
      allowAsConditionSource: true,
    },
    TestDate: {
      fieldId: 'TestDate',
      formLabel: i18n.t(`testDate`),
      columnHeader: i18n.t(`testResults.columns.date`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`fields.newFiles`),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
