import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRiskByIdQuery,
  GetRiskByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRiskByIdResponse = (
  variables: GetRiskByIdQueryVariables,
  response: GetRiskByIdQuery = {
    risk: [],
  }
): MockedResponse<GetRiskByIdQuery, GetRiskByIdQueryVariables> => ({
  request: {
    query: GetRiskByIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
