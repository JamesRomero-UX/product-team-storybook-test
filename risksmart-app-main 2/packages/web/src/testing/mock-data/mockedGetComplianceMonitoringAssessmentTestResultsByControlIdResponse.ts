import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetComplianceMonitoringAssessmentTestResultsByControlIdQuery,
  GetComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetComplianceMonitoringAssessmentTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetComplianceMonitoringAssessmentTestResultsByControlIdResponse =
  (
    variables: GetComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables,
    response: GetComplianceMonitoringAssessmentTestResultsByControlIdQuery = {
      control_test_second_line_result: [],
    }
  ): MockedResponse<
    GetComplianceMonitoringAssessmentTestResultsByControlIdQuery,
    GetComplianceMonitoringAssessmentTestResultsByControlIdQueryVariables
  > => ({
    request: {
      query: GetComplianceMonitoringAssessmentTestResultsByControlIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
