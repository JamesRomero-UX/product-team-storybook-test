import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetInternalAuditReportObligationAssessmentResultsByObligationIdQuery,
  GetInternalAuditReportObligationAssessmentResultsByObligationIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetInternalAuditReportObligationAssessmentResultsByObligationIdResponse =
  (
    variables: GetInternalAuditReportObligationAssessmentResultsByObligationIdQueryVariables,
    response: GetInternalAuditReportObligationAssessmentResultsByObligationIdQuery = {
      obligation_internal_audit_result: [],
    }
  ): MockedResponse<
    GetInternalAuditReportObligationAssessmentResultsByObligationIdQuery,
    GetInternalAuditReportObligationAssessmentResultsByObligationIdQueryVariables
  > => ({
    request: {
      query:
        GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
