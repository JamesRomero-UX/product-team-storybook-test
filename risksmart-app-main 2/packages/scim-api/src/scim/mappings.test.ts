import { describe, expect, it } from 'vitest';

import { mapScimUserToHasuraUpdate } from './mappings';
import type { ScimEnterpriseUser } from './types';
const scimUser: ScimEnterpriseUser = {
  schemas: [
    'urn:ietf:params:scim:schemas:core:2.0:User',
    'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
  ],
  id: '00001',
  externalId: '12345',
  userName: 'jdoe',
  emails: [{ value: 'jdoe@example.com', primary: true }],
  active: true,
  name: { givenName: 'John', familyName: 'Doe', formatted: 'John Doe' },
  title: 'Developer',
  addresses: [{ formatted: '123 Work St', type: 'work' }],
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
    department: 'Engineering',
  },
};

describe('mapScimUserToHasuraUpdate', () => {
  describe('PATCH request', () => {
    it('should map scimUser to database fields correctly for a PATCH request', () => {
      const result = mapScimUserToHasuraUpdate(scimUser, false);

      expect(result).toEqual({
        External_Id: '12345',
        UserName: 'jdoe',
        Email: 'jdoe@example.com',
        Status: 'active',
        FirstName: 'John',
        LastName: 'Doe',
        DisplayName: 'John Doe',
        JobTitle: 'Developer',
        OfficeLocation: '123 Work St',
        Department: 'Engineering',
      });
    });

    it('should not include fields with undefined values for a PATCH request', () => {
      const user = {
        ...scimUser,
        name: { givenName: 'John', familyName: 'Doe' },
        title: undefined,
        addresses: undefined,
        'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': undefined,
      };

      const result = mapScimUserToHasuraUpdate(user, false);

      expect(result).toEqual({
        External_Id: '12345',
        UserName: 'jdoe',
        Email: 'jdoe@example.com',
        Status: 'active',
        FirstName: 'John',
        LastName: 'Doe',
      });
    });
  });
  describe('PUT request', () => {
    it('should map scimUser to database fields correctly for a PUT request with null values for missing fields', () => {
      const result = mapScimUserToHasuraUpdate(scimUser, true);

      expect(result).toEqual({
        External_Id: '12345',
        UserName: 'jdoe',
        Email: 'jdoe@example.com',
        Status: 'active',
        FirstName: 'John',
        LastName: 'Doe',
        DisplayName: 'John Doe',
        JobTitle: 'Developer',
        OfficeLocation: '123 Work St',
        Department: 'Engineering',
      });
    });

    it('should not map values to null for non-nullable fields in PUT requests', () => {
      const user = {
        ...scimUser,
        externalId: undefined, // Non-nullable field
        emails: undefined, // Non-nullable field
        userName: undefined, // Non-nullable field
        active: undefined, // Non-nullable field
      };

      const result = mapScimUserToHasuraUpdate(user, true);

      expect(result).not.toHaveProperty('External_Id');
      expect(result).not.toHaveProperty('Email');
      expect(result).not.toHaveProperty('UserName');
      expect(result).not.toHaveProperty('Status');
    });

    it('should handle undefined values for all nullable fields in PUT requests', () => {
      const user = {
        ...scimUser,
        name: { givenName: 'John', familyName: 'Doe' },
        title: undefined,
        addresses: undefined,
        'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': undefined,
      };

      const result = mapScimUserToHasuraUpdate(user, true);

      expect(result).toEqual({
        External_Id: '12345',
        UserName: 'jdoe',
        Email: 'jdoe@example.com',
        Status: 'active',
        FirstName: 'John',
        LastName: 'Doe',
        DisplayName: null,
        JobTitle: null,
        OfficeLocation: null,
        Department: null,
      });
    });
  });

  it('should map only primary email if multiple emails are provided', () => {
    const user = {
      ...scimUser,
      emails: [
        { value: 'secondary@example.com' },
        { value: 'primary@example.com', primary: true },
      ],
    };

    const result = mapScimUserToHasuraUpdate(user, false);

    expect(result).toEqual({
      External_Id: '12345',
      UserName: 'jdoe',
      Email: 'primary@example.com',
      Status: 'active',
      FirstName: 'John',
      LastName: 'Doe',
      DisplayName: 'John Doe',
      JobTitle: 'Developer',
      OfficeLocation: '123 Work St',
      Department: 'Engineering',
    });
  });

  it('should map the first email if no primary email is specified', () => {
    const user = {
      ...scimUser,
      emails: [{ value: 'first@example.com' }, { value: 'second@example.com' }],
    };

    const result = mapScimUserToHasuraUpdate(user, false);

    expect(result).toEqual({
      External_Id: '12345',
      UserName: 'jdoe',
      Email: 'first@example.com',
      Status: 'active',
      FirstName: 'John',
      LastName: 'Doe',
      DisplayName: 'John Doe',
      JobTitle: 'Developer',
      OfficeLocation: '123 Work St',
      Department: 'Engineering',
    });
  });

  it('should map complex nested fields correctly', () => {
    const user = {
      ...scimUser,
      'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
        department: 'HR',
      },
    };

    const result = mapScimUserToHasuraUpdate(user, false);

    expect(result).toEqual({
      External_Id: '12345',
      UserName: 'jdoe',
      Email: 'jdoe@example.com',
      Status: 'active',
      FirstName: 'John',
      LastName: 'Doe',
      DisplayName: 'John Doe',
      JobTitle: 'Developer',
      OfficeLocation: '123 Work St',
      Department: 'HR',
    });
  });
});
