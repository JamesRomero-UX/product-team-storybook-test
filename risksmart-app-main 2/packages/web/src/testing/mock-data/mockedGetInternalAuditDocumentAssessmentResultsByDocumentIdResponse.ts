import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery,
  GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetInternalAuditReportDocumentAssessmentResultsByDocumentIdResponse =
  (
    variables: GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQueryVariables,
    response: GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery = {
      document_internal_audit_result: [],
    }
  ): MockedResponse<
    GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery,
    GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQueryVariables
  > => ({
    request: {
      query:
        GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
