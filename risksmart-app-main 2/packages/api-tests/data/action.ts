import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ActionInsertInput } from '../generated/graphql';
import { ActionStatusEnum } from '../generated/graphql';

const defaultAction: ActionInsertInput = {
  DateDue: '2023-04-24 22:41:58.03502+00',
  DateRaised: '2023-04-24 22:41:58.03502+00',
  Meta: undefined,
  Priority: 1,
  Status: ActionStatusEnum.Open,
  Title: 'Test',
  Description: 'Description',
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
  ClosedDate: undefined,
};

export const buildAction = (
  overrides: Partial<ActionInsertInput> = {}
): ActionInsertInput => {
  return {
    ...defaultAction,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
