import type {
  GetAllComplianceMonitoringAssessmentResultsQuery,
  GetAssessmentResultsByParentIdQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

type DocumentAssessmentResult =
  GetAllComplianceMonitoringAssessmentResultsQuery['document_second_line_result'][number];
type ObligationAssessmentResult =
  GetAllComplianceMonitoringAssessmentResultsQuery['obligation_second_line_result'][number];
type ControlledRiskAssessmentResult =
  GetAllComplianceMonitoringAssessmentResultsQuery['risk_controlled_second_line_result'][number];
type UncontrolledRiskAssessmentResult =
  GetAllComplianceMonitoringAssessmentResultsQuery['risk_uncontrolled_second_line_result'][number];

type Result =
  | ControlledRiskAssessmentResult
  | DocumentAssessmentResult
  | ObligationAssessmentResult
  | UncontrolledRiskAssessmentResult;

export type ComplianceMonitoringAssessmentResultFields = Result & {
  Id?: string;
  ControlType?: Risk_Assessment_Result_Control_Type_Enum;
  parent?: GetAssessmentResultsByParentIdQuery['test_result'][0]['parent'];
  OverallEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['OverallEffectiveness'];
  DesignEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['DesignEffectiveness'];
  PerformanceEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['PerformanceEffectiveness'];
  Likelihood?: null | number;
  Impact?: null | number;
};

export type ComplianceMonitoringAssessmentResultRegisterFields = {
  AssessmentTitle: string;
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
