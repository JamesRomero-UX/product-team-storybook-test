import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  InsertThirdPartyInput,
  ThirdPartyInsertInput,
  UpdateThirdPartyInput,
} from '../generated/graphql';

const defaultThirdParty: ThirdPartyInsertInput = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,
  Title: 'ACME Corp',
  Type: 'supplier',
  Status: 'active',
  Criticality: 2,
  CompanyName: 'ACME Corp',
  CompaniesHouseNumber: '12345678',
  Country: 'United Kingdom',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildThirdParty = (
  overrides: Partial<ThirdPartyInsertInput> = {}
): ThirdPartyInsertInput => ({
  ...defaultThirdParty,
  Id: randomUUID(),
  CreatedByUser: getDefaultUserId(),
  ModifiedByUser: getDefaultUserId(),
  OrgKey: getDefaultOrgId(),
  ...overrides,
});

const defaultInsertThirdPartyInput: InsertThirdPartyInput = {
  Title: 'ACME Corp',
  Type: 'supplier',
  Status: 'active',
  Criticality: 2,
  CompanyName: 'ACME Corp',
  CompaniesHouseNumber: '12345678',
  Country: 'United Kingdom',
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
};

export const buildInsertThirdPartyApi = (
  overrides: Partial<InsertThirdPartyInput> = {}
): InsertThirdPartyInput => ({
  ...defaultInsertThirdPartyInput,
  ...overrides,
});

const defaultUpdateThirdPartyInput: UpdateThirdPartyInput = {
  Id: '',
  Title: 'ACME Corp',
  Type: 'supplier',
  Status: 'active',
  Criticality: 2,
  CompanyName: 'ACME Corp',
  CompaniesHouseNumber: '12345678',
  Country: 'United Kingdom',
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
};

export const buildUpdateThirdPartyApi = (
  overrides: Partial<UpdateThirdPartyInput> = {}
): UpdateThirdPartyInput => ({
  ...defaultUpdateThirdPartyInput,
  ...overrides,
});
