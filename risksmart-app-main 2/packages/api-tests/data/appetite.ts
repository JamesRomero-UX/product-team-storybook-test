import type { VariablesOf } from '@graphql-typed-document-node/core';
import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  AppetiteInsertInput,
  AppetiteParentInsertInput,
  InsertChildAppetiteDocument,
} from '../generated/graphql';
import { AppetiteTypeEnum } from '../generated/graphql';

export const buildAppetiteParent = (
  overrides: Partial<AppetiteParentInsertInput> = {}
): AppetiteParentInsertInput => {
  return {
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    CreatedAtTimestamp: '2021-01-01T00:00:00Z',
    ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
    ...overrides,
  };
};

const defaultAppetite: AppetiteInsertInput = {
  LowerAppetite: 1,
  Statement: 'Some statement',
  UpperAppetite: 2,
  AppetiteType: AppetiteTypeEnum.Risk,
  ImpactAppetite: null,
  EffectiveDate: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  parents: {
    data: [buildAppetiteParent()],
  },
};
export const buildAppetite = (
  overrides: Partial<AppetiteInsertInput> = {}
): AppetiteInsertInput => {
  return {
    ...defaultAppetite,
    ModifiedAtTimestamp: new Date().toISOString(),
    CreatedAtTimestamp: new Date().toISOString(),
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    ...overrides,
  };
};

export const buildChildAppetite = (
  overrides: Partial<VariablesOf<typeof InsertChildAppetiteDocument>> = {}
): VariablesOf<typeof InsertChildAppetiteDocument> => {
  return {
    LowerAppetite: 1,
    Statement: 'Some statement',
    UpperAppetite: 2,
    AppetiteType: AppetiteTypeEnum.Risk,
    ImpactAppetite: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ParentRiskId: null as any as string,
    EffectiveDate: '2021-01-01T00:00:00Z',
    ...overrides,
  };
};
