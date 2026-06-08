import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery,
  GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse =
  (
    variables: GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables,
    response: GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery = {
      controlled: [],
      uncontrolled: [],
    }
  ): MockedResponse<
    GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery,
    GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables
  > => ({
    request: {
      query: GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
