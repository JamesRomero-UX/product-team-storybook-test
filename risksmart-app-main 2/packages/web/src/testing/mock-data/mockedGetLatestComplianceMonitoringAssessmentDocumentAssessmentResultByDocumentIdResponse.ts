import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery,
  GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdResponse =
  (
    variables: GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQueryVariables,
    response: GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery = {
      document_second_line_result: [],
    }
  ): MockedResponse<
    GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery,
    GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQueryVariables
  > => ({
    request: {
      query:
        GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
