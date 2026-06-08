import type { WorkflowId } from '@risksmart-app/shared/src/approvals/workflows';
import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  ApprovalInsertInput,
  ApproverInsertInput,
} from '../generated/graphql';
import { ApprovalInFlightEditRuleEnum } from '../generated/graphql';
import { buildApprovalLevel } from './approvalLevel';
import { buildApprover } from './approver';

const defaultApproval: ApprovalInsertInput = {
  InFlightEditRule: ApprovalInFlightEditRuleEnum.Approvers,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const changeRequestRequiredError =
  'You need to create a change request to perform this action.' as const;

export const buildApproval = (
  overrides: Partial<ApprovalInsertInput> = {}
): ApprovalInsertInput => {
  return {
    ...defaultApproval,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};

export const buildApprovalWorkflow = (
  workflow: WorkflowId,
  levels: ApproverInsertInput[][],
  parent?: string
) => {
  return buildApproval({
    Workflow: workflow,
    ParentId: parent,
    levels: {
      data: levels.map((approvers, index) =>
        buildApprovalLevel({
          Id: undefined,
          SequenceOrder: index + 1,
          approvers: {
            data: approvers.map((approver) =>
              buildApprover({ Id: undefined, ...approver })
            ),
          },
        })
      ),
    },
  });
};
