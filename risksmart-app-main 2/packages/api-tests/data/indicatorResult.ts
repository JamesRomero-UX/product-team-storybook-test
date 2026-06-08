import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IndicatorResultInsertInput } from '../generated/graphql';

const defaultIndicatorResult: IndicatorResultInsertInput = {
  Description: 'Indicator result description',
  TargetValueNum: 1,
  ResultDate: '2011-01-01',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildIndicatorResult = (
  overrides: Partial<IndicatorResultInsertInput> = {}
): IndicatorResultInsertInput => {
  return {
    ...defaultIndicatorResult,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
