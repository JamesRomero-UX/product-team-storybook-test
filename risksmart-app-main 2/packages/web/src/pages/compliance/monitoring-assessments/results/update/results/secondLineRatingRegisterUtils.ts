import type { GetSecondLineResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { SecondLineResultFields } from './types';

export const getSecondLineResultTableFields = (
  data: GetSecondLineResultsByParentIdQuery | undefined,
  assessmentId: string
): SecondLineResultFields[] | undefined => {
  return [
    ...(data?.document_second_line_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
    })) || []),
    ...(data?.obligation_second_line_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
    })) || []),
    ...(data?.risk_controlled_second_line_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
    })) || []),
    ...(data?.risk_uncontrolled_second_line_result.map((a) => ({
      ...a,
      ParentId: assessmentId,
      typename: a.__typename!,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
    })) || []),
    ...(data?.control_test_second_line_result.map((a) => ({
      Id: a.Id,
      ParentId: assessmentId,
      Impact: 0,
      Rating: 0,
      OverallEffectiveness: a.OverallEffectiveness,
      ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
      TestDate: a.TestDate,
      parents: [],
      parent: a.parent!,
      files: a.files,
      ancestorContributors: [],
      typename: a.__typename!,
    })) || []),
  ];
};
