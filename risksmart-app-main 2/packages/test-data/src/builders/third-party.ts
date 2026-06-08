import {
  ThirdPartyStatus,
  ThirdPartyType,
} from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildThirdParty = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'third_party'>>
): InferInsertModel<'third_party'> => ({
  Id: randomUUID(),
  OrgKey: orgKey,
  Title: 'Test Third Party',
  Description: 'Test third party description',
  CompanyName: 'Test Company Ltd',
  CompaniesHouseNumber: '12345678',
  Address: '123 Test Street',
  CityTown: 'London',
  Postcode: 'SW1A 1AA',
  Country: 'GB',
  PrimaryContactName: 'Test Contact',
  ContactName: 'Test Contact',
  ContactEmail: 'contact@test.com',
  CompanyDomain: 'test.com',
  Type: ThirdPartyType.Supplier,
  Status: ThirdPartyStatus.Active,
  Criticality: 1,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  CustomAttributeData: {},
  ...overrides,
});
