import type { ThirdPartyFormValues } from '../models/forms/ThirdPartyForm';

const defaultThirdPartyFormValues: ThirdPartyFormValues = {
  title: 'Third Party Title',
  description: 'Third Party Description',
  contactName: 'Third Party Contact Name',
  companiesHouseNumber: '12345678',
  address: '123 Third Party St',
  city: 'Third Party City',
  postcode: 'TP1 1TP',
  primaryContactName: 'Third Party Primary Contact Name',
  country: 'Third Party Country',
  email: 'thirdparty@example.com',
  companyDomain: 'thirdparty.com',
  companyName: 'Third Party Company Name',
  type: 'Partner',
  status: 'Active',
  criticality: 'Minimal',
  owners: ['RiskManager1'],
  contributors: ['Standard1'],
  tags: [],
  departments: [],
  attachFiles: [],
};

export const buildThirdPartyFormValues = (
  overrides: Partial<ThirdPartyFormValues> = {}
): ThirdPartyFormValues => ({
  ...defaultThirdPartyFormValues,
  ...overrides,
});
