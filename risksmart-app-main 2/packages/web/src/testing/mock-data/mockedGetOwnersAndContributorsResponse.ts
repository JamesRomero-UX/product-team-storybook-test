import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetOwnersAndContributorsQuery,
  GetOwnersAndContributorsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetOwnersAndContributorsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetOwnersAndContributorsResponse: MockedResponse<
  GetOwnersAndContributorsQuery,
  GetOwnersAndContributorsQueryVariables
> = {
  request: {
    query: GetOwnersAndContributorsDocument,
    variables: {
      parentId: 'parent-id',
    },
  },
  result: {
    data: {
      ancestor_contributor: [],
    },
  },
};
