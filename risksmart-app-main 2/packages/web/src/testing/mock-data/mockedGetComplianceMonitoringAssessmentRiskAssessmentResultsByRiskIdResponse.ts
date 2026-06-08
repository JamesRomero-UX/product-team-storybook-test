import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery,
  GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse =
  (
    variables: GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables,
    response: GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery = {
      risk_controlled_second_line_result: [],
      risk_uncontrolled_second_line_result: [],
    }
  ): MockedResponse<
    GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery,
    GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQueryVariables
  > => ({
    request: {
      query:
        GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
