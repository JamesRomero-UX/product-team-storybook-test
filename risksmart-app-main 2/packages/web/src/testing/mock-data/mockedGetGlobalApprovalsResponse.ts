import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetGlobalApprovalsQuery,
  GetGlobalApprovalsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetGlobalApprovalsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetGlobalApprovalsEmptyResponse = (
  parentId = '00000000-0000-0000-0000-000000000000'
): MockedResponse<
  GetGlobalApprovalsQuery,
  GetGlobalApprovalsQueryVariables
> => ({
  request: {
    query: GetGlobalApprovalsDocument,
    variables: {
      global: true,
      parentId,
    },
  },
  result: {
    data: {
      approval: [],
    },
  },
});

export const mockedGetGlobalApprovalsResponse = (
  parentId = '00000000-0000-0000-0000-000000000000'
): MockedResponse<
  GetGlobalApprovalsQuery,
  GetGlobalApprovalsQueryVariables
> => ({
  request: {
    query: GetGlobalApprovalsDocument,
    variables: {
      global: true,
      parentId,
    },
  },
  result: {
    data: {
      approval: [
        {
          __typename: 'approval',
          Id: 'approval-id',
          Workflow: 'publish-document-version',
          CreatedAtTimestamp: '2021-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
          createdBy: {
            __typename: 'user',
            Id: 'user-id',
            FriendlyName: 'John Doe',
          },
          levels: [],
        },
      ],
    },
  },
});
