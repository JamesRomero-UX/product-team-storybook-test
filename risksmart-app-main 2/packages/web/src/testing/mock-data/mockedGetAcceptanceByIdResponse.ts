import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAcceptanceByIdQuery,
  GetAcceptanceByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAcceptanceByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAcceptanceResponse = (
  variables: GetAcceptanceByIdQueryVariables,
  response: GetAcceptanceByIdQuery
): MockedResponse<GetAcceptanceByIdQuery, GetAcceptanceByIdQueryVariables> => ({
  request: {
    query: GetAcceptanceByIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
