import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { UserGroupInsertInput } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { mockDescription } from '../services/mockData';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

const schema = z.object({
  id: thirdPartyIdSchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  email: z.union([z.string().email(), z.string().length(0)]).nullable(),
  ownerContributor: z.boolean().nullable(),
});

type CsvType = z.infer<typeof schema>;
type InsertType = UserGroupInsertInput;

const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 0; i < generateConfig.userGroupCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `${removeNonAlphanumeric(firstName)}.${removeNonAlphanumeric(
      lastName
    )}@risksmart.com`;

    records.push({
      description: mockDescription(4, 10),
      id: (i + 1).toString(),
      email: email,
      name: `${firstName}'s group ${i}`,
      ownerContributor: true,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType, orgKey: string): InsertType => {
  return {
    Id: c.id,
    Name: c.name,
    Description: c.description,
    OwnerContributor: c.ownerContributor,
    Email: c.email,
    OrgKey: orgKey,
    CreatedAtTimestamp: undefined,
    ModifiedAtTimestamp: undefined,
    CreatedByUser: 'SYSTEM',
    ModifiedByUser: 'SYSTEM',
  };
};

export const sheet: Sheet<'userGroups.csv', CsvType, InsertType> = {
  name: 'userGroups.csv',
  schema,
  objectType: ParentTypePlus.UserGroup,
  fields: [
    {
      key: 'description',
      type: 'string',
    },
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },

    {
      key: 'email',
      fieldConfigFieldId: 'Email',
      type: 'string',
    },
    {
      key: 'name',
      fieldConfigFieldId: 'Name',
      type: 'string',
      unique: true,
    },
    {
      key: 'ownerContributor',
      type: 'boolean',
    },
  ],
  generateMockData,
  mapToInsert,
};
export default sheet;

function removeNonAlphanumeric(inputString: string) {
  return inputString.replace(/[^a-zA-Z0-9]/g, '');
}
