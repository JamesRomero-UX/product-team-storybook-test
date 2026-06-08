import { faker } from '@faker-js/faker';
import type { WorkflowId } from '@risksmart-app/shared/approvals/workflows';
import type { GetChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Approval_In_Flight_Edit_Rule_Enum,
  Approval_Rule_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ParentType } from 'src/rbac/Permission';

// TODO: need to remove randomness in test data for reproducible tests.
export const generateChangeRequest = (
  objectType: ParentType,
  approvalType: WorkflowId,
  parentTitle: string
): GetChangeRequestsQuery['change_request'][0] => {
  const parentId = faker.string.alphanumeric(16);

  return {
    Id: faker.string.alphanumeric(16),
    ParentId: parentId,
    SequentialId: 20,
    parent: {
      Id: parentId,
      SequentialId: Math.floor(Math.random() * 100 + 1),
      ObjectType: objectType,
      risk: {
        Title: parentTitle,
        owners: [
          {
            user: {
              Id: faker.string.alphanumeric(16),
              FriendlyName: faker.person.fullName(),
              Email: faker.internet.email(),
            },
          },
        ],
      },
      documentFile: {
        Version: '1.0',
        parent: {
          Id: faker.string.alphanumeric(16),
          SequentialId: Math.floor(Math.random() * 100 + 1),
          Title: parentTitle,
          owners: [
            {
              user: {
                Id: faker.string.alphanumeric(16),
                FriendlyName: faker.person.fullName(),
                Email: faker.internet.email(),
              },
            },
          ],
        },
      },
      acceptance: {
        Title: parentTitle,
        parents: [
          {
            risk: {
              owners: [
                {
                  user: {
                    Id: faker.string.alphanumeric(16),
                    FriendlyName: faker.person.fullName(),
                    Email: faker.internet.email(),
                  },
                },
              ],
            },
          },
        ],
      },
      control: {
        Title: parentTitle,
        owners: [
          {
            user: {
              Id: faker.string.alphanumeric(16),
              FriendlyName: faker.person.fullName(),
              Email: faker.internet.email(),
            },
          },
        ],
      },
      issue_assessment: {
        parent: {
          Id: faker.string.alphanumeric(16),
          Title: parentTitle,
          SequentialId: Math.floor(Math.random() * 100 + 1),
          owners: [
            {
              user: {
                Id: faker.string.alphanumeric(16),
                FriendlyName: faker.person.fullName(),
                Email: faker.internet.email(),
              },
            },
          ],
        },
      },
      action: {
        Title: parentTitle,
        owners: [
          {
            user: {
              Id: faker.string.alphanumeric(16),
              FriendlyName: faker.person.fullName(),
              Email: faker.internet.email(),
            },
          },
        ],
      },
    },
    CreatedAtTimestamp: '2021-01-01T00:00:00Z',
    ModifiedAtTimestamp: '2021-01-02T00:00:00Z',
    ChangeRequestStatus: 'approved',
    currentUserOwnerList: [],
    contributors: [],
    responses: [
      {
        Id: 'response-1',
        ModifiedAtTimestamp: '2021-01-03T00:00:00Z',
        CreatedAtTimestamp: '2021-01-03T00:00:00Z',
        approver: {
          Id: 'approver-1',
          level: {
            Id: 'level-1',
            SequenceOrder: 1,
            ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove,
            approval: {
              Id: 'approval-id-1',
              InFlightEditRule: Approval_In_Flight_Edit_Rule_Enum.Everyone,
              Workflow: approvalType,
            },
          },
        },
      },
    ],
  };
};
