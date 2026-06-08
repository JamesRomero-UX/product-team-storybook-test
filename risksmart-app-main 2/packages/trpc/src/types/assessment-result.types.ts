import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledQueryConfig,
  getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
  getDocumentAssessmentResultsByParentIdQueryConfig,
  getInternalAuditReportRiskAssessmentResultsByRiskIdControlledQueryConfig,
  getInternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledQueryConfig,
  getLatestDocumentAssessmentResultByDocumentIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment-result.query';

export type ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledResponseRow =
  InferQueryModel<
    'risk_uncontrolled_second_line_result',
    typeof getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledQueryConfig
  >;

export type ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledResponseRow =
  InferQueryModel<
    'risk_controlled_second_line_result',
    typeof getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledQueryConfig
  >;

export interface LatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse {
  uncontrolled: ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledResponseRow[];
  controlled: ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledResponseRow[];
}

export interface ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse {
  risk_uncontrolled_second_line_result: ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdUncontrolledResponseRow[];
  risk_controlled_second_line_result: ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdControlledResponseRow[];
}

export type InternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledResponseRow =
  InferQueryModel<
    'risk_uncontrolled_internal_audit_result',
    typeof getInternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledQueryConfig
  >;

export type InternalAuditReportRiskAssessmentResultsByRiskIdControlledResponseRow =
  InferQueryModel<
    'risk_controlled_internal_audit_result',
    typeof getInternalAuditReportRiskAssessmentResultsByRiskIdControlledQueryConfig
  >;

export interface LatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse {
  uncontrolled: InternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledResponseRow[];
  controlled: InternalAuditReportRiskAssessmentResultsByRiskIdControlledResponseRow[];
}

export interface InternalAuditReportRiskAssessmentResultsByRiskIdResponse {
  risk_uncontrolled_internal_audit_result: InternalAuditReportRiskAssessmentResultsByRiskIdUncontrolledResponseRow[];
  risk_controlled_internal_audit_result: InternalAuditReportRiskAssessmentResultsByRiskIdControlledResponseRow[];
}

export type LatestDocumentAssessmentResultByDocumentIdResponseRow =
  InferQueryModel<
    'document_assessment_result',
    typeof getLatestDocumentAssessmentResultByDocumentIdQueryConfig
  >;

export type DocumentAssessmentResultsByParentIdResponseRow = InferQueryModel<
  'document_assessment_result',
  typeof getDocumentAssessmentResultsByParentIdQueryConfig
>;
