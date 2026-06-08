import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { ThirdPartyInsertInput } from '../../generated/graphql';
import { ParentTypeEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription, mockTitle } from '../services/mockData';
import {
  CustomAttributeData,
  thirdPartyIdSchema,
} from '../services/sharedSchemas';
import type { Sheet } from './Sheet';

const schema = z.object({
  id: thirdPartyIdSchema,
  title: z.string().min(1, 'Required'),
  description: z.string().nullable(),
  companyName: z.string().min(1, 'Required'),
  companiesHouseNumber: z.string().nullable(),
  address: z.string().nullable(),
  cityTown: z.string().nullable(),
  postcode: z.string().nullable(),
  country: z.string().nullable(),
  primaryContactName: z.string().nullable(),
  contactName: z.string().nullable(),
  contactEmail: z.string().nullable(),
  companyDomain: z.string().nullable(),
  type: z.string().min(1, 'Required'),
  status: z.string().min(1, 'Required'),
  criticality: z.number().min(1),
  CustomAttributeData,
});

type CsvType = z.infer<typeof schema>;
type InsertType = ThirdPartyInsertInput;

const generateMockData = () => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.thirdPartyCount; i++) {
    const id = i + 1;

    records.push({
      id: id.toString(),
      title: mockTitle(),
      description: mockDescription(),
      companyName: faker.company.name(),
      companiesHouseNumber: faker.number.int({ min: 1, max: 1000 }).toString(),
      address: faker.location.secondaryAddress(),
      cityTown: faker.location.city(),
      postcode: faker.location.zipCode(),
      country: faker.location.country(),
      primaryContactName: faker.person.fullName(),
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      companyDomain: faker.internet.domainName(),
      type: faker.word.words({ count: 1 }),
      status: faker.word.words({ count: 1 }),
      criticality: faker.number.int({ min: 1, max: 100 }),
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    OrgKey: orgKey,
    Id: c.id,
    Title: c.title,
    Description: c.description,
    CompanyName: c.companyName,
    CompaniesHouseNumber: c.companiesHouseNumber,
    Address: c.address,
    CityTown: c.cityTown,
    Postcode: c.postcode,
    Country: c.country,
    PrimaryContactName: c.primaryContactName,
    ContactName: c.contactName,
    ContactEmail: c.contactEmail,
    CompanyDomain: c.companyDomain,
    Type: c.type,
    Criticality: c.criticality,
    Status: c.status,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
    CustomAttributeData: c.CustomAttributeData,
  };
};

export const sheet: Sheet<'thirdParties.csv', CsvType, InsertType> = {
  name: 'thirdParties.csv',
  customAttributeType: ParentTypeEnum.ThirdParty,
  schema,
  objectType: ParentTypeEnum.ThirdParty,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'title',
      fieldConfigFieldId: 'Title',
      type: 'string',
    },
    {
      key: 'description',
      fieldConfigFieldId: 'Description',
      type: 'string',
    },
    {
      key: 'companyName',
      fieldConfigFieldId: 'CompanyName',
      type: 'string',
    },
    {
      key: 'companiesHouseNumber',
      fieldConfigFieldId: 'CompaniesHouseNumber',
      type: 'string',
    },

    {
      key: 'address',
      fieldConfigFieldId: 'Address',
      type: 'string',
    },
    {
      key: 'cityTown',
      fieldConfigFieldId: 'CityTown',
      type: 'string',
    },
    {
      key: 'postcode',
      fieldConfigFieldId: 'Postcode',
      type: 'string',
    },
    {
      key: 'country',
      fieldConfigFieldId: 'Country',
      type: 'string',
    },
    {
      key: 'primaryContactName',
      fieldConfigFieldId: 'PrimaryContactName',
      type: 'string',
    },
    {
      key: 'contactName',
      fieldConfigFieldId: 'ContactName',
      type: 'string',
    },
    {
      key: 'contactEmail',
      fieldConfigFieldId: 'ContactEmail',
      type: 'string',
    },
    {
      key: 'companyDomain',
      fieldConfigFieldId: 'CompanyDomain',
      type: 'string',
    },

    {
      key: 'type',
      fieldConfigFieldId: 'Type',
      type: 'string',
    },
    {
      key: 'status',
      fieldConfigFieldId: 'Status',
      type: 'string',
    },
    {
      key: 'criticality',
      fieldConfigFieldId: 'Criticality',
      type: 'number',
    },
  ],
  generateMockData,
  mapToInsert,
};
export default sheet;
