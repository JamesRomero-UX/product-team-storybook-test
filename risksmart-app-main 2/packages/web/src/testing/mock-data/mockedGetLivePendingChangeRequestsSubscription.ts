import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLivePendingChangeRequestsSubscription,
  GetLivePendingChangeRequestsSubscriptionVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_Status_Enum,
  GetLivePendingChangeRequestsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLivePendingChangeRequestsSubscription = (
  type?: string,
  parentId?: string,
  response?: GetLivePendingChangeRequestsSubscription
): MockedResponse<
  GetLivePendingChangeRequestsSubscription,
  GetLivePendingChangeRequestsSubscriptionVariables
> => ({
  request: {
    query: GetLivePendingChangeRequestsDocument,
    variables: { ParentId: parentId ?? 'parent-id' },
  },
  result: {
    data: {
      change_request: [
        {
          Id: 'change-request-id',
          SequentialId: 1,
          Type: type ?? 'update',
          CreatedAtTimestamp: '2021-08-02T14:00:00Z',
          ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
          ParentId: parentId ?? 'parent-id',
          Comment: '',
          RequestedChanges: { parents: [] },
          contributors: [],
          requestedFileChanges: [],
          responses: [],
          ChangeRequestStatus: Approval_Status_Enum.Pending,
          createdBy: {
            FriendlyName: 'User1',
            Email: 'user1@user.com',
          },
        },
      ],
      ...response,
    },
  },
});
