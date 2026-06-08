import {
  addAssessmentActivityUrl,
  addComplianceMonitoringAssessmentActivityUrl,
  addInternalAuditActivityUrl,
  assessmentActivitiesDetailsUrl,
  assessmentActivitiesRegisterUrl,
  assessmentResultsUrl,
  complianceMonitoringAssessmentActivitiesDetailsUrl,
  complianceMonitoringAssessmentActivitiesRegisterUrl,
  complianceMonitoringAssessmentResultsUrl,
  internalAuditReportActivitiesDetailsUrl,
  internalAuditReportActivitiesRegisterUrl,
  internalAuditReportResultsUrl,
} from '@/utils/urls';

import type { AssessmentTypeEnum } from './types';

interface AssessmentTypeConfig {
  routing: {
    resultsRegisterUrl: (id: string) => string;
    activityAddUrl: (id: string) => string;
    activityRegisterUrl: (id: string) => string;
    activityEditUrl: (id: string, activityId: string) => string;
  };
}

export const useAssessmentTypeConfig = (
  assessmentMode: AssessmentTypeEnum
): AssessmentTypeConfig => {
  switch (assessmentMode) {
    case 'rating': {
      return {
        routing: {
          resultsRegisterUrl: assessmentResultsUrl,
          activityAddUrl: addAssessmentActivityUrl,
          activityEditUrl: assessmentActivitiesDetailsUrl,
          activityRegisterUrl: assessmentActivitiesRegisterUrl,
        },
      };
    }
    case 'compliance_monitoring_assessment': {
      return {
        routing: {
          resultsRegisterUrl: complianceMonitoringAssessmentResultsUrl,
          activityAddUrl: addComplianceMonitoringAssessmentActivityUrl,
          activityEditUrl: complianceMonitoringAssessmentActivitiesDetailsUrl,
          activityRegisterUrl:
            complianceMonitoringAssessmentActivitiesRegisterUrl,
        },
      };
    }
    case 'internal_audit_report': {
      return {
        routing: {
          resultsRegisterUrl: internalAuditReportResultsUrl,
          activityAddUrl: addInternalAuditActivityUrl,
          activityEditUrl: internalAuditReportActivitiesDetailsUrl,
          activityRegisterUrl: internalAuditReportActivitiesRegisterUrl,
        },
      };
    }
  }
};
