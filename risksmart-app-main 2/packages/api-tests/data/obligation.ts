import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  InsertChildObligationInput,
  ObligationInsertInput,
  UpdateChildObligationInput,
} from '../generated/graphql';
import {
  ObligationTypeEnum,
  ObligationTypeEnumAction,
} from '../generated/graphql';

const defaultObligation: ObligationInsertInput = {
  Adherence: 'flexible',
  Type: ObligationTypeEnum.Standard,
  Title: 'Obligation Tile',
  Description: 'Obligation description',

  CreatedAtTimestamp: undefined,

  ModifiedAtTimestamp: undefined,
};

export const buildObligation = (
  overrides: Partial<ObligationInsertInput> = {}
): ObligationInsertInput => {
  return {
    ...defaultObligation,
    Id: randomUUID(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};

const defaultInsertChildObligationInput: InsertChildObligationInput = {
  Adherence: 'flexible',
  Type: ObligationTypeEnumAction.Standard,
  Title: 'Obligation Tile',
  Description: 'Obligation description',
  OwnerGroupIds: [],
  OwnerUserIds: [],
  ContributorGroupIds: [],
  schedule: {},
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  TagTypeIds: [],
};
export const buildInsertChildObligation = (
  overrides: Partial<InsertChildObligationInput> = {}
): InsertChildObligationInput => {
  return {
    ...defaultInsertChildObligationInput,
    ...overrides,
  };
};

const defaultUpdateChildObligationInput: UpdateChildObligationInput = {
  Id: '',
  Adherence: 'flexible',
  Type: ObligationTypeEnumAction.Standard,
  Title: 'Obligation Tile',
  Description: 'Obligation description',
  OwnerGroupIds: [],
  OwnerUserIds: [],
  ContributorGroupIds: [],
  schedule: {},
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  TagTypeIds: [],
};
export const buildUpdateChildObligation = (
  overrides: Partial<UpdateChildObligationInput> = {}
): UpdateChildObligationInput => {
  return {
    ...defaultUpdateChildObligationInput,
    ...overrides,
  };
};
