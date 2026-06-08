import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IssueUpdateInsertInput } from '../generated/graphql';

const defaultIssueUpdate: IssueUpdateInsertInput = {
  Description: 'Some issue update description',
  Title: 'Some title',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildIssueUpdate = (overrides: IssueUpdateInsertInput) => {
  return {
    ...defaultIssueUpdate,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
