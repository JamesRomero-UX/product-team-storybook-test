import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ApprovalLevelInsertInput } from '../generated/graphql';
import { ApprovalRuleTypeEnum } from '../generated/graphql';

const defaultApprovalLevel: ApprovalLevelInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  Description: 'Approval Level description',
  SequenceOrder: 1,
  ApprovalRuleType: ApprovalRuleTypeEnum.AllApprove,
};

export const buildApprovalLevel = (
  overrides: Partial<ApprovalLevelInsertInput> = {}
): ApprovalLevelInsertInput => {
  return {
    ...defaultApprovalLevel,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
