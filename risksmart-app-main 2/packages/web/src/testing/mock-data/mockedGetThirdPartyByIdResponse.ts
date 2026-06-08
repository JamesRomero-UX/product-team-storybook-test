import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetThirdPartyByIdQuery,
  GetThirdPartyByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetThirdPartyByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetThirdPartyByIdResponse = (
  variables: GetThirdPartyByIdQueryVariables,
  response: GetThirdPartyByIdQuery['third_party']
): MockedResponse<GetThirdPartyByIdQuery, GetThirdPartyByIdQueryVariables> => ({
  request: {
    query: GetThirdPartyByIdDocument,
    variables,
  },
  result: {
    data: {
      third_party: response
        ? {
            __typename: 'third_party',
            ...response,
          }
        : null,
    },
  },
});
