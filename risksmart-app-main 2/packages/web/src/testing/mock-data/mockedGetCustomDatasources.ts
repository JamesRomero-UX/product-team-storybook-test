import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetCustomDatasourcesQuery,
  GetCustomDatasourcesQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetCustomDatasourcesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetCustomDatasources = (
  response: GetCustomDatasourcesQuery = {
    custom_datasource: [],
  }
): MockedResponse<
  GetCustomDatasourcesQuery,
  GetCustomDatasourcesQueryVariables
> => ({
  request: {
    query: GetCustomDatasourcesDocument,
  },
  result: {
    data: response,
  },
});
