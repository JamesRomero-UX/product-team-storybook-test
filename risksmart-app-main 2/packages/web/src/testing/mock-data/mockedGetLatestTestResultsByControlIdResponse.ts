import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestTestResultsByControlIdQuery,
  GetLatestTestResultsByControlIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestTestResultsByControlIdResponse = (
  variables: GetLatestTestResultsByControlIdQueryVariables,
  response: GetLatestTestResultsByControlIdQuery = {
    test_result: [],
  }
): MockedResponse<
  GetLatestTestResultsByControlIdQuery,
  GetLatestTestResultsByControlIdQueryVariables
> => ({
  request: {
    query: GetLatestTestResultsByControlIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
