import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetApprovalLevelsQuery,
  GetApprovalLevelsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_Rule_Type_Enum,
  GetApprovalLevelsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetApprovalLevels = (
  response?: GetApprovalLevelsQuery
): MockedResponse<GetApprovalLevelsQuery, GetApprovalLevelsQueryVariables> => ({
  request: {
    query: GetApprovalLevelsDocument,
    variables: {
      ParentId: 'parent-id',
      Workflow: 'workflow',
    },
  },
  result: {
    data: {
      levels: [
        {
          Id: 'level-1',
          ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
          approvers: [
            {
              Id: 'approver-id1',
              UserId: 'user-id1',
              UserGroupId: null,
              OwnerApprover: false,
              group: {
                Id: 'group-id',
                users: [],
              },
            },
          ],
        },
        {
          Id: 'level-2',
          ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
          approvers: [
            {
              Id: 'approver-id2',
              UserId: 'user-id2',
              UserGroupId: null,
              OwnerApprover: false,
              group: {
                Id: 'group-id',
                users: [],
              },
            },
          ],
        },
      ],
      ...response,
    },
  },
});
