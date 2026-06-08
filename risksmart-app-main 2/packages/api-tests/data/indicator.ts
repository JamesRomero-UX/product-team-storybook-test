import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IndicatorInsertInput } from '../generated/graphql';
import { IndicatorTypeEnum } from '../generated/graphql';

const defaultIndicator: IndicatorInsertInput = {
  Description: 'Indicator description',
  Title: 'Indicator Title',
  Type: IndicatorTypeEnum.Text,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildIndicator = (
  overrides: Partial<IndicatorInsertInput> = {}
): IndicatorInsertInput => {
  return {
    ...defaultIndicator,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
