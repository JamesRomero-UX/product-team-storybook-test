import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery,
  GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdResponse =
  (
    variables: GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQueryVariables,
    response: GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery = {
      document_internal_audit_result: [],
    }
  ): MockedResponse<
    GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery,
    GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQueryVariables
  > => ({
    request: {
      query:
        GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
