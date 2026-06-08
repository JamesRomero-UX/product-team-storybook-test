import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAttestationStatusQuery,
  GetAttestationStatusQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAttestationStatusDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAttestationStatusResponse = (
  variables: GetAttestationStatusQueryVariables,
  response: GetAttestationStatusQuery
): MockedResponse<
  GetAttestationStatusQuery,
  GetAttestationStatusQueryVariables
> => ({
  request: {
    query: GetAttestationStatusDocument,
    variables,
  },
  result: {
    data: response,
  },
});
