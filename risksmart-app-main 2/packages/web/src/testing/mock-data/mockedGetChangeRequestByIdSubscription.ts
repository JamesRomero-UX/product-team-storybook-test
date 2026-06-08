import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetChangeRequestByIdSubscription,
  GetChangeRequestByIdSubscriptionVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_In_Flight_Edit_Rule_Enum,
  Approval_Rule_Type_Enum,
  Approval_Status_Enum,
  GetChangeRequestByIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetChangeRequestByIdSubscription = (
  response?: GetChangeRequestByIdSubscription
): MockedResponse<
  GetChangeRequestByIdSubscription,
  GetChangeRequestByIdSubscriptionVariables
> => ({
  request: {
    query: GetChangeRequestByIdDocument,
    variables: { Id: 'change-request-id' },
  },
  result: {
    data: {
      change_request_by_pk: {
        Id: 'change-request-id',
        SequentialId: 1,
        Type: 'Change Request',
        CreatedAtTimestamp: '2021-08-02T14:00:00Z',
        ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
        Comment: '',
        ParentId: 'parent-id',
        contributors: [],
        requestedFileChanges: [],
        responses: [
          {
            Id: 'response-1',
            ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
            CreatedAtTimestamp: '2021-08-02T14:00:00Z',
            approver: {
              Id: 'approver-1',
              level: {
                Id: 'level-1',
                ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
                SequenceOrder: 1,
                approval: {
                  ParentId: 'parent-id',
                  InFlightEditRule: Approval_In_Flight_Edit_Rule_Enum.Everyone,
                  Id: 'approval-id1',
                  Workflow: 'workflow',
                },
              },
            },
          },
        ],
        ChangeRequestStatus: Approval_Status_Enum.Pending,
        createdBy: {
          FriendlyName: 'User1',
          Email: 'user1@user.com',
        },
      },
      ...response,
    },
  },
});
