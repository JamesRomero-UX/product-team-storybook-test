import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery,
  GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdResponse =
  (
    variables: GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQueryVariables,
    response: GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery = {
      obligation_second_line_result: [],
    }
  ): MockedResponse<
    GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQuery,
    GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdQueryVariables
  > => ({
    request: {
      query:
        GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
