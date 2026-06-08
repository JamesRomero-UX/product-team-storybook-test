import type {
  GetSecondLineResultsByParentIdQuery,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type SecondLineResultFields = CollectionData<
  | GetSecondLineResultsByParentIdQuery['document_second_line_result'][0]
  | GetSecondLineResultsByParentIdQuery['obligation_second_line_result'][0]
  | GetSecondLineResultsByParentIdQuery['risk_controlled_second_line_result'][0]
  | GetSecondLineResultsByParentIdQuery['risk_uncontrolled_second_line_result'][0]
> & {
  typename: string;
  Id: string;
  ParentId: string;
  ControlType?: Risk_Assessment_Result_Control_Type_Enum;
  parent?: GetSecondLineResultsByParentIdQuery['control_test_second_line_result'][0]['parent'];
  OverallEffectiveness?: GetSecondLineResultsByParentIdQuery['control_test_second_line_result'][0]['OverallEffectiveness'];
  DesignEffectiveness?: GetSecondLineResultsByParentIdQuery['control_test_second_line_result'][0]['DesignEffectiveness'];
  PerformanceEffectiveness?: GetSecondLineResultsByParentIdQuery['control_test_second_line_result'][0]['PerformanceEffectiveness'];
  Likelihood?: GetSecondLineResultsByParentIdQuery['risk_controlled_second_line_result'][0]['Likelihood'];
  Impact?: GetSecondLineResultsByParentIdQuery['risk_controlled_second_line_result'][0]['Impact'];
};

export type SecondLineResultRegisterFields = SecondLineResultFields & {
  TypeLabelled: string;
  ParentTitle: string;
  RatingLabelled: string | undefined;
};
