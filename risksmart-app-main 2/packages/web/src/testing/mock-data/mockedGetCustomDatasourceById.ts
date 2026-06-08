import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetCustomDatasourceByIdQuery,
  GetCustomDatasourceByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetCustomDatasourceByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetCustomDatasourceById = (
  variables: GetCustomDatasourceByIdQueryVariables,
  response: GetCustomDatasourceByIdQuery = {
    custom_datasource_by_pk: undefined,
  }
): MockedResponse<
  GetCustomDatasourceByIdQuery,
  GetCustomDatasourceByIdQueryVariables
> => ({
  request: { variables, query: GetCustomDatasourceByIdDocument },
  result: {
    data: response,
  },
});
