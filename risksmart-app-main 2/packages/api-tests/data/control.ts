import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ControlInsertInput } from '../generated/graphql';
import { ControlTypeEnum } from '../generated/graphql';

const defaultControl: ControlInsertInput = {
  Description: 'Description 1',
  Meta: undefined,
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-02-01T00:00:00Z',
  Title: 'Control 1',

  Type: ControlTypeEnum.Preventive,
};

export const buildControl = (
  overrides: Partial<ControlInsertInput> = {}
): ControlInsertInput => {
  return {
    ...defaultControl,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
