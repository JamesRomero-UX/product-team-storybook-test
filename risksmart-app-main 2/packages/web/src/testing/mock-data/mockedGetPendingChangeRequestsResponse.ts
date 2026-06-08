import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetPendingChangeRequestsQuery,
  GetPendingChangeRequestsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetPendingChangeRequestsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetPendingChangeRequests = (
  variables: GetPendingChangeRequestsQueryVariables,
  response: GetPendingChangeRequestsQuery
): MockedResponse<
  GetPendingChangeRequestsQuery,
  GetPendingChangeRequestsQueryVariables
> => ({
  request: {
    query: GetPendingChangeRequestsDocument,
    variables,
  },
  result: {
    data: response,
  },
});
