import type {
  GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery,
  GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery,
  GetRiskAssessmentResultsByRiskIdQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type ComplianceRiskAssessmentResultFlatFields = CollectionData<
  GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['risk_controlled_second_line_result'][number]
> & { ControlType: Risk_Assessment_Result_Control_Type_Enum };

type MappedFields = {
  ParentTitle: string;
  ActualCompletionDate: string;
  ControlTypeLabelled: string;
  CompletionDate: string;
  StatusLabelled: string;
  RatingLabelled: string;
  ImpactLabelled: string;
  LikelihoodLabelled: string;
};

export type ComplianceRiskAssessmentResultRegisterFields =
  ComplianceRiskAssessmentResultFlatFields & MappedFields;

export type InternalAuditRiskAssessmentResultFlatFields = CollectionData<
  GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery['risk_controlled_internal_audit_result'][number]
> & { ControlType: Risk_Assessment_Result_Control_Type_Enum };

export type InternalAuditRiskAssessmentResultRegisterFields =
  InternalAuditRiskAssessmentResultFlatFields & MappedFields;

export type RiskAssessmentResultFlatFields = CollectionData<
  GetRiskAssessmentResultsByRiskIdQuery['risk_assessment_result'][number]
>;

export type RiskAssessmentResultRegisterFields =
  RiskAssessmentResultFlatFields & MappedFields;
