import type {
  GetAllInternalAuditReportResultsQuery,
  GetAssessmentResultsByParentIdQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

type DocumentAssessmentResult =
  GetAllInternalAuditReportResultsQuery['document_internal_audit_result'][number];
type ObligationAssessmentResult =
  GetAllInternalAuditReportResultsQuery['obligation_internal_audit_result'][number];
type ControlledRiskAssessmentResult =
  GetAllInternalAuditReportResultsQuery['risk_controlled_internal_audit_result'][number];
type UncontrolledRiskAssessmentResult =
  GetAllInternalAuditReportResultsQuery['risk_uncontrolled_internal_audit_result'][number];

type Result =
  | ControlledRiskAssessmentResult
  | DocumentAssessmentResult
  | ObligationAssessmentResult
  | UncontrolledRiskAssessmentResult;

export type InternalAuditReportResultFields = Result & {
  Id?: string;
  ControlType?: Risk_Assessment_Result_Control_Type_Enum;
  parent?: GetAssessmentResultsByParentIdQuery['test_result'][0]['parent'];
  OverallEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['OverallEffectiveness'];
  DesignEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['DesignEffectiveness'];
  PerformanceEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['PerformanceEffectiveness'];
  Likelihood?: null | number;
  Impact?: null | number;
};

export type InternalAuditReportResultRegisterFields = {
  AuditTitle: string;
  TypeLabelled: string;
  ParentTitle: string;
  RatingLabelled: string | undefined;
  ImpactLabelled: string | undefined;
  LikelihoodLabelled: string | undefined;
  StartDate: null | string | undefined;
  ActualCompletionDate: null | string | undefined;
  CompletedByUser: string;
  Status: string;
  StatusLabelled: string;
  TestDate: null | string | undefined;
  originalResult: Result;
  Rationale: null | string | undefined;
  Id: null | string | undefined;
};
