import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery,
  GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse =
  (
    variables: GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables,
    response: GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = {
      controlled: [],
      uncontrolled: [],
    }
  ): MockedResponse<
    GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery,
    GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables
  > => ({
    request: {
      query:
        GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
