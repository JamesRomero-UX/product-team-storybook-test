import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery,
  GetInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetInternalAuditReportRiskAssessmentResultsByRiskIdResponse =
  (
    variables: GetInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables,
    response: GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery = {
      risk_controlled_internal_audit_result: [],
      risk_uncontrolled_internal_audit_result: [],
    }
  ): MockedResponse<
    GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery,
    GetInternalAuditReportRiskAssessmentResultsByRiskIdQueryVariables
  > => ({
    request: {
      query: GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
