import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetActiveAppetitesByParentIdQuery,
  GetActiveAppetitesByParentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActiveAppetitesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetActiveAppetitesByParentIdResponse = (
  variables: GetActiveAppetitesByParentIdQueryVariables,
  response: GetActiveAppetitesByParentIdQuery = {
    appetite_parent: [],
  }
): MockedResponse<
  GetActiveAppetitesByParentIdQuery,
  GetActiveAppetitesByParentIdQueryVariables
> => ({
  request: { variables, query: GetActiveAppetitesByParentIdDocument },
  result: {
    data: response,
  },
});
