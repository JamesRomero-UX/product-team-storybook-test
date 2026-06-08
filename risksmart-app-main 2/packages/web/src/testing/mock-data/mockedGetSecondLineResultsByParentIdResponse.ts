import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetSecondLineResultsByParentIdQuery,
  GetSecondLineResultsByParentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetSecondLineResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetSecondLineResultsByParentIdResponse = (
  variables: GetSecondLineResultsByParentIdQueryVariables,
  response: GetSecondLineResultsByParentIdQuery
): MockedResponse<
  GetSecondLineResultsByParentIdQuery,
  GetSecondLineResultsByParentIdQueryVariables
> => ({
  request: {
    query: GetSecondLineResultsByParentIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
