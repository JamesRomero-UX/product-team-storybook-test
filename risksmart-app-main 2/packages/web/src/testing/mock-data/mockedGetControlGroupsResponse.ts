import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetControlGroupsQuery,
  GetControlGroupsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetControlGroupsResponse = (
  variables: GetControlGroupsQueryVariables,
  response: GetControlGroupsQuery = {
    control_group: [],
  }
): MockedResponse<GetControlGroupsQuery, GetControlGroupsQueryVariables> => ({
  request: {
    query: GetControlGroupsDocument,
    variables,
  },
  result: {
    data: response,
  },
});
