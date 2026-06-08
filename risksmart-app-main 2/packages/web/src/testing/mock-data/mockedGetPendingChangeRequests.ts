import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetPendingChangeRequestsQuery,
  GetPendingChangeRequestsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_Status_Enum,
  GetPendingChangeRequestsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetPendingChangeRequests = (
  response?: GetPendingChangeRequestsQuery
): MockedResponse<
  GetPendingChangeRequestsQuery,
  GetPendingChangeRequestsQueryVariables
> => ({
  request: {
    query: GetPendingChangeRequestsDocument,
    variables: { ParentId: 'parent-id' },
  },
  result: {
    data: {
      change_request: [
        {
          Id: '1',
          SequentialId: 1,
          ParentId: 'parent-id',
          Type: 'Change Request',
          CreatedAtTimestamp: '2021-08-02T14:00:00Z',
          ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
          contributors: [],
          requestedFileChanges: [],
          responses: [],
          Comment: '',
          ChangeRequestStatus: Approval_Status_Enum.Pending,
          createdBy: {
            FriendlyName: 'User1',
            Email: '',
          },
        },
      ],
      ...response,
    },
  },
});
