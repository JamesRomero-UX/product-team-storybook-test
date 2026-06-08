import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetBusinessAreasQuery,
  GetBusinessAreasQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetBusinessAreasDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedBusinessAreasResponse = (
  response: GetBusinessAreasQuery = { business_area: [] }
): MockedResponse<GetBusinessAreasQuery, GetBusinessAreasQueryVariables> => ({
  request: {
    query: GetBusinessAreasDocument,
  },
  result: {
    data: response,
  },
});
