import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getObligationAssessmentResultFormConfig = () => {
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
    ObligationIds: {
      fieldId: 'ObligationIds',
      formLabel: i18n.t('assessmentResults.fields.Obligation'),
    },
    Rating: {
      fieldId: 'Rating',
      formLabel: i18n.t('assessmentResults.fields.Rating'),
      displayType: { displayType: 'rating', ratingKey: 'performance_result' },
    },
    Rationale: {
      fieldId: 'Rationale',
      formLabel: i18n.t('assessmentResults.fields.Rationale'),
    },
    TestDate: {
      fieldId: 'TestDate',
      formLabel: i18n.t('assessmentResults.fields.TestDate'),
      displayType: { displayType: 'date' },
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t('assessmentResults.fields.newFiles'),
    },
  } as const satisfies FormConfig;
};
