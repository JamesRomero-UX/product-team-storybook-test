import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ControlGroupInsertInput } from '../generated/graphql';

const defaultControl: ControlGroupInsertInput = {
  Meta: undefined,

  Title: 'Control Group 1',

  Description: 'Control group 1',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildControlGroup = (
  overrides: Partial<ControlGroupInsertInput> = {}
): ControlGroupInsertInput => {
  return {
    ...defaultControl,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    Owner: getDefaultUserId(),
    ...overrides,
  };
};
