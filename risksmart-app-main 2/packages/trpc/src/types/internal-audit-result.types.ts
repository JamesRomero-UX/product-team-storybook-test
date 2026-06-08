import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getControlTestInternalAuditResultsQueryConfig,
  getDocumentInternalAuditResultsQueryConfig,
  getInternalAuditResultByIdQueryConfig,
  getLatestDocumentInternalAuditResultByDocumentIdQueryConfig,
  getObligationInternalAuditResultsQueryConfig,
  getRiskControlledInternalAuditResultsQueryConfig,
  getRiskUncontrolledInternalAuditResultsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/internal-audit-result.query';

import type {
  GetActionsByInternalAuditReportIdResponse,
  GetImpactByInternalAuditReportIdResponse,
  GetImpactInternalAuditRatingByInternalAuditReportIdResponseRow,
  GetIssuesByInternalAuditReportIdResponse,
} from './index';

export type GetDocumentInternalAuditResultsResponseRow = InferQueryModel<
  'document_internal_audit_result',
  typeof getDocumentInternalAuditResultsQueryConfig
>;

export type GetLatestDocumentInternalAuditResultByDocumentIdResponseRow =
  InferQueryModel<
    'document_internal_audit_result',
    typeof getLatestDocumentInternalAuditResultByDocumentIdQueryConfig
  >;

export type GetObligationInternalAuditResultsResponseRow = InferQueryModel<
  'obligation_internal_audit_result',
  typeof getObligationInternalAuditResultsQueryConfig
>;

export type GetRiskControlledInternalAuditResultsResponseRow = InferQueryModel<
  'risk_controlled_internal_audit_result',
  typeof getRiskControlledInternalAuditResultsQueryConfig
>;

export type GetRiskUncontrolledInternalAuditResultsResponseRow =
  InferQueryModel<
    'risk_uncontrolled_internal_audit_result',
    typeof getRiskUncontrolledInternalAuditResultsQueryConfig
  >;

export type GetControlTestInternalAuditResultsResponseRow = InferQueryModel<
  'control_test_internal_audit_result',
  typeof getControlTestInternalAuditResultsQueryConfig
>;

export type InternalAuditResultByIdResponseRow = InferQueryModel<
  'internal_audit_result_parent',
  typeof getInternalAuditResultByIdQueryConfig
>;

export interface InternalAuditResultsByParentIdResponse {
  document_internal_audit_result: GetDocumentInternalAuditResultsResponseRow[];
  obligation_internal_audit_result: GetObligationInternalAuditResultsResponseRow[];
  risk_controlled_internal_audit_result: GetRiskControlledInternalAuditResultsResponseRow[];
  risk_uncontrolled_internal_audit_result: GetRiskUncontrolledInternalAuditResultsResponseRow[];
  control_test_internal_audit_result: GetControlTestInternalAuditResultsResponseRow[];
  impact_internal_audit_rating: GetImpactInternalAuditRatingByInternalAuditReportIdResponseRow[];
  issue: GetIssuesByInternalAuditReportIdResponse[];
  impact: GetImpactByInternalAuditReportIdResponse[];
  action: GetActionsByInternalAuditReportIdResponse[];
}
