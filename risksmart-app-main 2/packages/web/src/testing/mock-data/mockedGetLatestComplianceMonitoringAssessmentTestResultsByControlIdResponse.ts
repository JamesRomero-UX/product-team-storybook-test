import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery,
  GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestComplianceMonitoringAssessmentTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestComplianceMonitoringAssessmentTestResultsByControlIdResponse =
  (
    variables: GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables,
    response: GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery = {
      control_test_second_line_result: [],
    }
  ): MockedResponse<
    GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery,
    GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables
  > => ({
    request: {
      query:
        GetLatestComplianceMonitoringAssessmentTestResultsByControlIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
