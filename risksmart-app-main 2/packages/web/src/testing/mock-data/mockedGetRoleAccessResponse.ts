import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRoleAccessQuery,
  GetRoleAccessQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRoleAccessDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GraphQLError } from 'graphql/error/GraphQLError';

export const mockedRoleAccessResponse = (
  response: GetRoleAccessQuery = {
    role_access: [],
  }
): MockedResponse<GetRoleAccessQuery, GetRoleAccessQueryVariables> => ({
  request: {
    query: GetRoleAccessDocument,
  },
  result: {
    data: response,
  },
});

export const mockedRoleAccessErrorResponse: MockedResponse<
  GetRoleAccessQuery,
  GetRoleAccessQueryVariables
> = {
  request: {
    query: GetRoleAccessDocument,
  },
  result: {
    errors: [new GraphQLError('Doh')],
  },
};
