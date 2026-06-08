import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetEntitiesQuery,
  GetEntitiesQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEntitiesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetEntities = (
  response: GetEntitiesQuery['entity'] = []
): MockedResponse<GetEntitiesQuery, GetEntitiesQueryVariables> => ({
  request: {
    query: GetEntitiesDocument,
    variables: {},
  },
  result: {
    data: {
      entity: response,
    },
  },
});
