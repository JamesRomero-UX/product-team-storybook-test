import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestRiskAssessmentResultConfigQuery,
  GetLatestRiskAssessmentResultConfigQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestRiskAssessmentResultConfigDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestRiskAssessmentResultConfig = (
  response: GetLatestRiskAssessmentResultConfigQuery = {
    risk_assessment_result_config: [],
  }
): MockedResponse<
  GetLatestRiskAssessmentResultConfigQuery,
  GetLatestRiskAssessmentResultConfigQueryVariables
> => ({
  request: {
    query: GetLatestRiskAssessmentResultConfigDocument,
  },
  result: {
    data: response,
  },
});
