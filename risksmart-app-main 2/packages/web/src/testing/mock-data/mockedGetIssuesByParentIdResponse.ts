import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetIssuesByParentIdQuery,
  GetIssuesByParentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssuesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetIssuesByParentIdResponse = (
  variables: GetIssuesByParentIdQueryVariables,
  response: GetIssuesByParentIdQuery = {
    issue: [],
  }
): MockedResponse<
  GetIssuesByParentIdQuery,
  GetIssuesByParentIdQueryVariables
> => ({
  request: {
    query: GetIssuesByParentIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
