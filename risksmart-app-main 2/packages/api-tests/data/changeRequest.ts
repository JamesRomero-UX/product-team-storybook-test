import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ChangeRequestInsertInput } from '../generated/graphql';
import { ApprovalStatusEnum } from '../generated/graphql';

const defaultChangeRequest: ChangeRequestInsertInput = {
  CreatedAtTimestamp: '2023-04-24 22:41:58.03502+00',
  ModifiedAtTimestamp: new Date().toISOString(),
  ChangeRequestStatus: ApprovalStatusEnum.Pending,
  RequestedChanges: '',
  Comment: '',
  Type: 'delete',
};

export const buildChangeRequest = (
  overrides: Partial<ChangeRequestInsertInput> = {}
): ChangeRequestInsertInput => {
  return {
    ...defaultChangeRequest,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    ModifiedByUser: getDefaultUserId(),
    ActionUserId: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    ...overrides,
  };
};
