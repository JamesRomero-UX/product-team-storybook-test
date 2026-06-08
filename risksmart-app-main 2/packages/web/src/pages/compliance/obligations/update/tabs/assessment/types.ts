import type {
  Assessment_Status_Enum,
  GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery,
  GetInternalAuditReportObligationAssessmentResultsByObligationIdQuery,
  GetObligationAssessmentResultsByObligationIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type ComplianceObligationAssessmentResultFlatFields = CollectionData<
  GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery['obligation_second_line_result'][number]
>;

export type ComplianceObligationAssessmentResultRegisterFields =
  ComplianceObligationAssessmentResultFlatFields & {
    CompletionDate: null | string | undefined;
    NextTestDate: null | string | undefined;
    Title: null | string | undefined;
    Result: null | string | undefined;
    LinkedComplianceMonitoringId: string | undefined;
    Status: Assessment_Status_Enum | undefined;
  };

export type InternalAuditObligationAssessmentResultFlatFields = CollectionData<
  GetInternalAuditReportObligationAssessmentResultsByObligationIdQuery['obligation_internal_audit_result'][number]
>;

export type InternalAuditObligationAssessmentResultRegisterFields =
  InternalAuditObligationAssessmentResultFlatFields & {
    CompletionDate: null | string | undefined;
    NextTestDate: null | string | undefined;
    Title: null | string | undefined;
    Result: null | string | undefined;
    LinkedInternalAuditId: string | undefined;
    Status: Assessment_Status_Enum | undefined;
  };

export type ObligationAssessmentResultFlatFields = CollectionData<
  GetObligationAssessmentResultsByObligationIdQuery['obligation_assessment_result'][number]
>;

export type ObligationAssessmentResultRegisterFields =
  ObligationAssessmentResultFlatFields & {
    CompletionDate: null | string | undefined;
    NextTestDate: null | string | undefined;
    Title: null | string | undefined;
    Result: null | string | undefined;
    LinkedAssessmentId: string | undefined;
    Status: Assessment_Status_Enum | undefined;
  };
