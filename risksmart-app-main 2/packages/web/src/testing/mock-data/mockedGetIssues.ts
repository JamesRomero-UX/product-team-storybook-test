import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetIssuesQuery,
  GetIssuesQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssuesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetIssues = (
  variables: GetIssuesQueryVariables,
  response: GetIssuesQuery = {
    issue: [],
  }
): MockedResponse<GetIssuesQuery, GetIssuesQueryVariables> => ({
  request: {
    query: GetIssuesDocument,
    variables,
  },
  result: {
    data: response,
  },
});
