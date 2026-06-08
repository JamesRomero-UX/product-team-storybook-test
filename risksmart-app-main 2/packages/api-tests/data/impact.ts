import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  ImpactInsertInput,
  InsertImpactInput,
  UpdateImpactInput,
} from '../generated/graphql';

const defaultImpactBackend: ImpactInsertInput = {
  Name: 'Impact 1',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildImpactBackend = (
  overrides: Partial<ImpactInsertInput> = {}
): ImpactInsertInput => {
  return {
    ...defaultImpactBackend,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    Id: randomUUID(),
    ...overrides,
  };
};

const insertImpactInput: InsertImpactInput = {
  Name: 'Impact 1',
  Rationale: '',
  RatingGuidance: '',
  LikelihoodAppetite: 2,
  OwnerGroupIds: [],
  OwnerUserIds: [],
};

export const buildInsertImpactApi = (
  overrides: Partial<InsertImpactInput> = {}
): InsertImpactInput => {
  return {
    ...insertImpactInput,
    OwnerUserIds: [getDefaultUserId()],
    ...overrides,
  };
};

const updateImpactInput: UpdateImpactInput = {
  Name: 'Impact 1',
  Rationale: '',
  RatingGuidance: '',
  LikelihoodAppetite: 2,
  OwnerGroupIds: [],
  OwnerUserIds: [],
  Id: '',
};

export const buildUpdateImpactApi = (
  overrides: Partial<UpdateImpactInput> = {}
): UpdateImpactInput => {
  return {
    ...updateImpactInput,
    OwnerUserIds: [getDefaultUserId()],
    ...overrides,
  };
};
