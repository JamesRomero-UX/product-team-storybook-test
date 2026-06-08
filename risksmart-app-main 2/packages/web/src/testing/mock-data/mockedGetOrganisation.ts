import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetOrganisationQuery,
  GetOrganisationQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetOrganisationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GraphQLError } from 'graphql';

export const mockedGetOrganisation = (
  response: GetOrganisationQuery = {
    auth_organisation: [],
  }
): MockedResponse<GetOrganisationQuery, GetOrganisationQueryVariables> => ({
  request: {
    query: GetOrganisationDocument,
  },
  result: {
    data: response,
  },
});
export const mockedGetOrganisationErrorResponse: MockedResponse<
  GetOrganisationQuery,
  GetOrganisationQueryVariables
> = {
  request: {
    query: GetOrganisationDocument,
  },
  result: {
    errors: [new GraphQLError('Doh')],
  },
};
