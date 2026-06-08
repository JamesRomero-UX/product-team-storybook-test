import type {
  GetAllAssessmentResultsQuery,
  GetAssessmentResultsByParentIdQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { ResultType } from '../modals/types';

type DocumentAssessmentResult =
  GetAllAssessmentResultsQuery['document_assessment_result'][number];
type ObligationAssessmentResult =
  GetAllAssessmentResultsQuery['obligation_assessment_result'][number];
type RiskAssessmentResult =
  GetAllAssessmentResultsQuery['risk_assessment_result'][number];

type Result =
  | DocumentAssessmentResult
  | ObligationAssessmentResult
  | RiskAssessmentResult;

export type AssessmentResultFields = Result & {
  Id?: string;
  ControlType?: Risk_Assessment_Result_Control_Type_Enum;
  parent?: GetAssessmentResultsByParentIdQuery['test_result'][0]['parent'];
  OverallEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['OverallEffectiveness'];
  DesignEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['DesignEffectiveness'];
  PerformanceEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['PerformanceEffectiveness'];
  Likelihood?: null | number;
  Impact?: null | number;
};

export type AssessmentResultRegisterFields = {
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
  Id: string;
  ResultType: ResultType;
};
