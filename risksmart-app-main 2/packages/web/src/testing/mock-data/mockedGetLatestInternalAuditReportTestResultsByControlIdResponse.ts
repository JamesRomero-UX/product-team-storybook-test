import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestInternalAuditReportTestResultsByControlIdQuery,
  GetLatestInternalAuditReportTestResultsByControlIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestInternalAuditReportTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestInternalAuditReportTestResultsByControlIdResponse =
  (
    variables: GetLatestInternalAuditReportTestResultsByControlIdQueryVariables,
    response: GetLatestInternalAuditReportTestResultsByControlIdQuery = {
      control_test_internal_audit_result: [],
    }
  ): MockedResponse<
    GetLatestInternalAuditReportTestResultsByControlIdQuery,
    GetLatestInternalAuditReportTestResultsByControlIdQueryVariables
  > => ({
    request: {
      query: GetLatestInternalAuditReportTestResultsByControlIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
