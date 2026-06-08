import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetTestResultsByControlIdQuery,
  GetTestResultsByControlIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetTestResultsByControlIdResponse = (
  variables: GetTestResultsByControlIdQueryVariables,
  response: GetTestResultsByControlIdQuery = {
    test_result: [],
  }
): MockedResponse<
  GetTestResultsByControlIdQuery,
  GetTestResultsByControlIdQueryVariables
> => ({
  request: {
    query: GetTestResultsByControlIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
