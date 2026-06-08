import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  InsertChildRiskInput,
  RiskInsertInput,
  UpdateChildRiskInput,
} from '../generated/graphql';
import { buildScheduleInput } from './schedule';

const defaultRisk: RiskInsertInput = {
  Description: 'Risk description',
  ParentRiskId: undefined,
  Tier: 1,
  Title: 'Risk Title',
  Meta: undefined,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildRisk = (
  overrides: Partial<RiskInsertInput> = {}
): RiskInsertInput => {
  return {
    ...defaultRisk,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultChildRisk: InsertChildRiskInput = {
  Description: 'Risk description',
  ParentRiskId: undefined,
  Tier: 1,
  Title: 'Risk Title',
  OwnerUserIds: [],
  ContributorUserIds: [],
  OwnerGroupIds: [],
  ContributorGroupIds: [],
  TagTypeIds: [],
  DepartmentTypeIds: [],
  schedule: buildScheduleInput(),
};

export const buildInsertChildRisk = (
  overrides: Partial<InsertChildRiskInput> = {}
): InsertChildRiskInput => {
  return {
    ...defaultChildRisk,
    ...overrides,
  };
};

export const buildUpdateChildRisk = (
  overrides: Partial<UpdateChildRiskInput> = {}
): UpdateChildRiskInput => {
  return {
    Id: defaultRisk.Id!,
    ...defaultChildRisk,
    ...overrides,
  };
};
