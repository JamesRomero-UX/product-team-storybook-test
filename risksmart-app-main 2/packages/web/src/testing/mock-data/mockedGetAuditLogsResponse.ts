import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAuditLogsQuery,
  GetAuditLogsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAuditLogsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAuditLogsResponse = (
  response: GetAuditLogsQuery = {
    audit_log_view: [],
  }
): MockedResponse<GetAuditLogsQuery, GetAuditLogsQueryVariables> => ({
  request: {
    query: GetAuditLogsDocument,
    variables: {
      limit: 25,
      offset: 0,
      where: {},
      orderBy: { ModifiedAtTimestamp: 'desc' },
    },
  },
  result: {
    data: response,
  },
});
