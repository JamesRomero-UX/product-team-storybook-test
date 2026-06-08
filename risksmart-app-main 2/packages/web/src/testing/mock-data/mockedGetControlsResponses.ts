import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetControlsQuery,
  GetControlsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetControlsResponse = (
  variables: GetControlsQueryVariables = {},
  response: GetControlsQuery = {
    control: [],
  }
): MockedResponse<GetControlsQuery, GetControlsQueryVariables> => ({
  request: {
    query: GetControlsDocument,
    variables,
  },
  result: {
    data: response,
  },
});
