import type { HasuraUser, ScimEnterpriseUser } from './types';

export interface FieldMapping {
  scimField: string;
  dbField: string;
  nullableOnPut: boolean;
  getScimValue: (scimUser: ScimEnterpriseUser) => unknown;
  getDbValue: (dbUser: HasuraUser) => unknown;
}

export const fieldMappings: FieldMapping[] = [
  {
    scimField: 'externalId',
    dbField: 'External_Id',
    nullableOnPut: false,
    getScimValue: (scimUser) => scimUser.externalId,
    getDbValue: (dbUser) => dbUser.organisationusers?.[0]?.External_Id,
  },
  {
    scimField: 'userName',
    dbField: 'UserName',
    nullableOnPut: false,
    getScimValue: (scimUser) => scimUser.userName,
    getDbValue: (dbUser) => dbUser.UserName,
  },
  {
    scimField: 'email',
    dbField: 'Email',
    nullableOnPut: false,
    getScimValue: (scimUser) =>
      scimUser.emails?.find((email) => email.primary)?.value ||
      scimUser.emails?.[0]?.value,
    getDbValue: (dbUser) => dbUser.Email,
  },
  {
    scimField: 'status',
    dbField: 'Status',
    nullableOnPut: false,
    getScimValue: (scimUser) =>
      scimUser.active !== undefined
        ? scimUser.active
          ? 'active'
          : 'archived'
        : undefined,
    getDbValue: (dbUser) => dbUser.Status === 'active',
  },
  {
    scimField: 'firstName',
    dbField: 'FirstName',
    nullableOnPut: false,
    getScimValue: (scimUser) => scimUser.name?.givenName,
    getDbValue: (dbUser) => dbUser.FirstName,
  },
  {
    scimField: 'lastName',
    dbField: 'LastName',
    nullableOnPut: false,
    getScimValue: (scimUser) => scimUser.name?.familyName,
    getDbValue: (dbUser) => dbUser.LastName,
  },
  {
    scimField: 'displayName',
    dbField: 'DisplayName',
    nullableOnPut: true,
    getScimValue: (scimUser) => scimUser.name?.formatted,
    getDbValue: (dbUser) => dbUser.DisplayName,
  },
  {
    scimField: 'jobTitle',
    dbField: 'JobTitle',
    nullableOnPut: true,
    getScimValue: (scimUser) => scimUser.title,
    getDbValue: (dbUser) => dbUser.JobTitle,
  },
  {
    scimField: 'officeLocation',
    dbField: 'OfficeLocation',
    nullableOnPut: true,
    getScimValue: (scimUser) =>
      scimUser.addresses?.find((address) => address.type === 'work')
        ?.formatted || scimUser.addresses?.[0]?.formatted,
    getDbValue: (dbUser) => dbUser.OfficeLocation,
  },
  {
    scimField: 'department',
    dbField: 'Department',
    nullableOnPut: true,
    getScimValue: (scimUser) =>
      scimUser['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User']
        ?.department,
    getDbValue: (dbUser) => dbUser.Department,
  },
];
