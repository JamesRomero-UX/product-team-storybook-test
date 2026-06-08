import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery,
  GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdResponse =
  (
    variables: GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQueryVariables,
    response: GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery = {
      document_second_line_result: [],
    }
  ): MockedResponse<
    GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery,
    GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQueryVariables
  > => ({
    request: {
      query:
        GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
