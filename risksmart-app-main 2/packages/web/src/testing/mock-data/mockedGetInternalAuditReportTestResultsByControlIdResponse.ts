import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetInternalAuditReportTestResultsByControlIdQuery,
  GetInternalAuditReportTestResultsByControlIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetInternalAuditReportTestResultsByControlIdResponse = (
  variables: GetInternalAuditReportTestResultsByControlIdQueryVariables,
  response: GetInternalAuditReportTestResultsByControlIdQuery = {
    control_test_internal_audit_result: [],
  }
): MockedResponse<
  GetInternalAuditReportTestResultsByControlIdQuery,
  GetInternalAuditReportTestResultsByControlIdQueryVariables
> => ({
  request: {
    query: GetInternalAuditReportTestResultsByControlIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
