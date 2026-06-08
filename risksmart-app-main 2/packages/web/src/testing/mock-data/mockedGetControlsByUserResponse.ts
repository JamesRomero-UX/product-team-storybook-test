import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetControlsByUserQuery,
  GetControlsByUserQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlsByUserDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetControlsByUserResponse = (
  variables: GetControlsByUserQueryVariables,
  response: GetControlsByUserQuery = {
    control: [],
  }
): MockedResponse<GetControlsByUserQuery, GetControlsByUserQueryVariables> => ({
  request: {
    query: GetControlsByUserDocument,
    variables,
  },
  result: {
    data: response,
  },
});
