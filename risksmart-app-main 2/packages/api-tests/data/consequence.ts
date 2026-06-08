import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ConsequenceInsertInput } from '../generated/graphql';
import { CostTypeEnum } from '../generated/graphql';

const defaultConsequence: ConsequenceInsertInput = {
  Description: 'Description 1',
  Meta: undefined,
  ModifiedAtTimestamp: undefined,
  Title: 'Consequence 1',
  CostType: CostTypeEnum.Hours,
  CostValue: 180,
  Criticality: 5,
  CreatedAtTimestamp: undefined,
  CreatedByUser: undefined,
};

export const buildConsequence = (
  overrides: Partial<ConsequenceInsertInput> = {}
): ConsequenceInsertInput => {
  return {
    ...defaultConsequence,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
