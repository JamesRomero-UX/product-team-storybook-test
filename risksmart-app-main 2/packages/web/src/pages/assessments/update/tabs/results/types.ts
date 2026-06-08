import type {
  GetAssessmentResultsByParentIdQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type AssessmentResultFields = CollectionData<
  | GetAssessmentResultsByParentIdQuery['document_assessment_result'][0]
  | GetAssessmentResultsByParentIdQuery['obligation_assessment_result'][0]
  | GetAssessmentResultsByParentIdQuery['risk_assessment_result'][0]
> & {
  typename: string;
  Id: string;
  AssessmentId: string;
  Likelihood?: number | null;
  Impact?: number | null;
  ControlType?: Risk_Assessment_Result_Control_Type_Enum;
  parent?: GetAssessmentResultsByParentIdQuery['test_result'][0]['parent'];
  OverallEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['OverallEffectiveness'];
  DesignEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['DesignEffectiveness'];
  PerformanceEffectiveness?: GetAssessmentResultsByParentIdQuery['test_result'][0]['PerformanceEffectiveness'];
};

export type AssessmentResultRegisterFields = AssessmentResultFields & {
  TypeLabelled: string;
  ParentTitle: string;
  RatingLabelled: string | undefined;
};
