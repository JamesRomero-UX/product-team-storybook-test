import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetChangeRequestByParentIdSubscription,
  GetChangeRequestByParentIdSubscriptionVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_In_Flight_Edit_Rule_Enum,
  Approval_Rule_Type_Enum,
  Approval_Status_Enum,
  GetChangeRequestByParentIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetChangeRequestByParentIdSubscription = (
  parentId?: string,
  override?: { userId: string; timestamp: string }
): MockedResponse<
  GetChangeRequestByParentIdSubscription,
  GetChangeRequestByParentIdSubscriptionVariables
> => ({
  request: {
    query: GetChangeRequestByParentIdDocument,
    variables: { Id: parentId ?? 'parent-id' },
  },
  result: {
    data: {
      __typename: 'subscription_root',
      change_request: [
        {
          Id: 'change-request-id-1',
          SequentialId: 1,
          Type: 'Change Request',
          CreatedAtTimestamp: '2021-08-02T14:00:00Z',
          ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
          ParentId: parentId ?? 'parent-id',
          Comment: '',
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
                    ParentId: parentId ?? 'parent-id',
                    InFlightEditRule:
                      Approval_In_Flight_Edit_Rule_Enum.Everyone,
                    Id: 'approval-id1',
                    Workflow: 'workflow',
                  },
                },
              },
            },
          ],
          ChangeRequestStatus: Approval_Status_Enum.Failed,
          createdBy: {
            FriendlyName: 'User1',
            Email: 'user1@user.com',
          },
        },
        {
          Id: 'change-request-id-2',
          SequentialId: 2,
          Type: 'Change Request',
          CreatedAtTimestamp: '2021-08-02T14:00:00Z',
          ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
          ParentId: parentId ?? 'parent-id',
          Comment: 'this is a rationale',
          contributors: [],
          requestedFileChanges: [],
          responses: [
            {
              Id: 'response-2',
              ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
              CreatedAtTimestamp: '2021-08-02T14:00:00Z',
              approver: {
                Id: 'approver-2',
                level: {
                  Id: 'level-1',
                  ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
                  SequenceOrder: 1,
                  approval: {
                    ParentId: parentId ?? 'parent-id',
                    InFlightEditRule:
                      Approval_In_Flight_Edit_Rule_Enum.Everyone,
                    Id: 'approval-id1',
                    Workflow: 'workflow',
                  },
                },
              },
            },
          ],
          ChangeRequestStatus: Approval_Status_Enum.Rejected,
          createdBy: {
            FriendlyName: 'User1',
            Email: 'user1@user.com',
          },
          OverriddenByUser: override?.userId,
          OverriddenAtTimestamp: override?.timestamp,
        },
        {
          Id: 'change-request-id-3',
          SequentialId: 3,
          Type: 'Change Request',
          CreatedAtTimestamp: '2021-08-02T14:00:00Z',
          ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
          ParentId: parentId ?? 'parent-id',
          Comment: '',
          contributors: [],
          requestedFileChanges: [],
          responses: [
            {
              Id: 'response-3',
              ModifiedAtTimestamp: '2021-08-02T14:00:00Z',
              CreatedAtTimestamp: '2021-08-02T14:00:00Z',
              approver: {
                Id: 'approver-3',
                level: {
                  Id: 'level-1',
                  ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
                  SequenceOrder: 1,
                  approval: {
                    ParentId: parentId ?? 'parent-id',
                    InFlightEditRule:
                      Approval_In_Flight_Edit_Rule_Enum.Everyone,
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
      ],
    },
  },
});
