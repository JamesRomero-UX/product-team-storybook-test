import type { GetAssessmentResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { AssessmentResultFields } from './types';

export const getAssessmentResultTableFields = (
  data: GetAssessmentResultsByParentIdQuery | undefined,
  assessmentId: string
): AssessmentResultFields[] | undefined => {
  return [
    ...(data?.document_assessment_result.map((a) => ({
      ...a,
      AssessmentId: assessmentId,
      typename: a.__typename!,
    })) || []),
    ...(data?.obligation_assessment_result.map((a) => ({
      ...a,
      AssessmentId: assessmentId,
      typename: a.__typename!,
    })) || []),
    ...(data?.risk_assessment_result.map((a) => ({
      ...a,
      AssessmentId: assessmentId,
      typename: a.__typename!,
    })) || []),
    ...(data?.test_result.map((a) => ({
      Id: a.Id,
      AssessmentId: assessmentId,
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
