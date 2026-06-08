import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRiskAssessmentResultsByRiskIdQuery,
  GetRiskAssessmentResultsByRiskIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRiskAssessmentResultsByRiskIdResponse = (
  variables: GetRiskAssessmentResultsByRiskIdQueryVariables,
  response: GetRiskAssessmentResultsByRiskIdQuery = {
    risk_assessment_result: [],
  }
): MockedResponse<
  GetRiskAssessmentResultsByRiskIdQuery,
  GetRiskAssessmentResultsByRiskIdQueryVariables
> => ({
  request: {
    query: GetRiskAssessmentResultsByRiskIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
