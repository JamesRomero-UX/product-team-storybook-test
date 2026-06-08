import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { faker } from '@faker-js/faker';
import { z } from 'zod';

import type { AuthUserInsertInput } from '../../generated/graphql';
import { UserStatusEnum } from '../../generated/graphql';
import { generateConfig } from '../generateConfig';
import { getUserByEmail } from '../graphqlClient';
import { thirdPartyIdSchema } from '../services/sharedSchemas';
import type { CsvLineErrorType } from '../utils/logging';
import type { Sheet } from './Sheet';
import { ParentTypePlus } from './types';

const schema = z.object({
  id: thirdPartyIdSchema,
  userName: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string(),
});

type CsvType = z.infer<typeof schema>;
type InsertType = AuthUserInsertInput;

export const generateMockData = (): CsvType[] => {
  const records: CsvType[] = [];
  for (let i = 1; i <= generateConfig.userCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `${firstName}.${lastName}@risksmart.com`;
    records.push({
      id: i.toString(),
      userName: faker.person.fullName(),
      firstName,
      lastName,
      email,
    });
  }

  return records;
};

const mapToInsert = (c: CsvType): InsertType => {
  return {
    Id: c.id,
    UserName: c.userName,
    AuthClientName: null,
    AuthClient_Id: null,
    AuthConnection: null,
    AuthConnection_Id: null,
    AuthTenant: null,
    BusinessUnit_Id: null,
    CreatedOn: undefined,
    Email: c.email.toLowerCase(),
    FirstName: c.firstName,
    LastName: c.lastName,
    LastSeen: null,
    Meta: null,
    RoleKey: null,
    organisationusers: null,
    Status: UserStatusEnum.Active,
  };
};

export const sheet: Sheet<'users.csv', CsvType, InsertType> = {
  name: 'users.csv',
  schema,
  objectType: ParentTypePlus.User,
  fields: [
    {
      key: 'id',
      type: 'string',
      isPrimaryKey: true,
    },
    {
      key: 'userName',
      fieldConfigFieldId: 'UserName',
      type: 'string',
    },
    {
      key: 'firstName',
      fieldConfigFieldId: 'FirstName',
      type: 'string',
    },
    {
      key: 'lastName',
      fieldConfigFieldId: 'LastName',
      type: 'string',
    },
    {
      key: 'email',
      fieldConfigFieldId: 'Email',
      type: 'string',
      unique: true,
    },
  ],
  generateMockData,
  mapToInsert,
  async customValidation(
    records: CsvType[],
    client: ApolloClient<NormalizedCacheObject>
  ) {
    const errors: CsvLineErrorType[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (!record) {
        continue;
      }
      const { data, errors: getUserErrors } = await getUserByEmail(
        { email: record.email },
        client
      );
      if (getUserErrors) {
        throw getUserErrors[0];
      }
      if (data.user.length !== 0) {
        errors.push({
          file: 'users.csv',
          row: i + 2,
          message: `User email already exists: ${record.email}`,
        });
      }
    }

    return errors;
  },
};
export default sheet;
