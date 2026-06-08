import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getRiskAssessmentResultFormConfig = () => {
  return {
    AssessmentId: {
      fieldId: 'AssessmentId',
      formLabel: i18n.t('assessmentResults.fields.Assessment'),
    },
    ComplianceMonitoringAssessmentId: {
      fieldId: 'ComplianceMonitoringAssessmentId',
      formLabel: i18n.t(
        'assessmentResults.fields.ComplianceMonitoringAssessment'
      ),
    },
    InternalAuditReportId: {
      fieldId: 'InternalAuditReportId',
      formLabel: i18n.t('assessmentResults.fields.InternalAuditReport'),
    },
    RiskIds: {
      fieldId: 'RiskIds',
      formLabel: i18n.t('assessmentResults.fields.Risk'),
    },
    ControlType: {
      fieldId: 'ControlType',
      formLabel: i18n.t('assessmentResults.fields.ControlType'),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'assessmentResults.controlTypesCased',
      },
    },
    Likelihood: {
      fieldId: 'Likelihood',
      formLabel: i18n.t('assessmentResults.fields.Likelihood'),
      displayType: { displayType: 'rating', ratingKey: 'likelihood' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    Impact: {
      fieldId: 'Impact',
      formLabel: i18n.t('assessmentResults.fields.Impact'),
      displayType: { displayType: 'rating', ratingKey: 'impact' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    Rating: {
      fieldId: 'Rating',
      formLabel: i18n.t('assessmentResults.fields.Rating'),
      // the options for this are based on control type, which is problematic when adding condtions as we don't know the control type yet
    },
    Rationale: {
      fieldId: 'Rationale',
      formLabel: i18n.t('assessmentResults.fields.Rationale'),
      allowTargetConditions: true,
    },
    TestDate: {
      fieldId: 'TestDate',
      formLabel: i18n.t('assessmentResults.fields.TestDate'),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t('assessmentResults.fields.newFiles'),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
