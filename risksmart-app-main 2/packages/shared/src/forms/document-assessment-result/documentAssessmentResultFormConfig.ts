import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getDocumentAssessmentResultFormConfig = () => {
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
    DocumentIds: {
      fieldId: 'DocumentIds',
      formLabel: i18n.t('assessmentResults.fields.Document'),
    },
    Rating: {
      fieldId: 'Rating',
      formLabel: i18n.t('assessmentResults.fields.Rating'),
      displayType: { displayType: 'rating', ratingKey: 'performance_result' },
      allowAsConditionSource: true,
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
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t('assessmentResults.fields.newFiles'),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
