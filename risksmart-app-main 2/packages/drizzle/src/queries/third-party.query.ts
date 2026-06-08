import type { QueryConfig } from '../db';
import { thirdParty } from './fragments/third-party';
import {
  ancestorContributors,
  modifiedByAndCreatedByUser,
  ownersAndContributors,
  relationFiles,
  tagsAndDepartments,
} from './utils';

export const getThirdPartyQueryConfig = {
  ...thirdParty,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'third_party'>;

export const getThirdPartiesQueryConfig = {
  columns: {
    Id: true,
    SequentialId: true,
    Title: true,
    Description: true,
    CompanyName: true,
    CompaniesHouseNumber: true,
    Address: true,
    CityTown: true,
    Postcode: true,
    Country: true,
    PrimaryContactName: true,
    ContactName: true,
    ContactEmail: true,
    CompanyDomain: true,
    Type: true,
    Status: true,
    Criticality: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
    ModifiedByUser: true,
    CreatedByUser: true,
    CustomAttributeData: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...modifiedByAndCreatedByUser,
  },
} as const satisfies QueryConfig<'third_party'>;

export const getThirdPartyByIdQueryConfig = {
  columns: {
    Id: true,
    SequentialId: true,
    Title: true,
    Description: true,
    CompanyName: true,
    CompaniesHouseNumber: true,
    Address: true,
    CityTown: true,
    Postcode: true,
    Country: true,
    PrimaryContactName: true,
    ContactName: true,
    ContactEmail: true,
    CompanyDomain: true,
    Type: true,
    Status: true,
    Criticality: true,
    CreatedByUser: true,
    CustomAttributeData: true,
    ModifiedByUser: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...modifiedByAndCreatedByUser,
    ...ancestorContributors,
    ...relationFiles,
  },
} as const satisfies QueryConfig<'third_party'>;
