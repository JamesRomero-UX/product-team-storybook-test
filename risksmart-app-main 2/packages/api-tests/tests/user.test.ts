import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('user', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 9 },
      { ...standardEnhancedUser1, expectedRecords: 9 },
      { ...readOnlyUser1, expectedRecords: 9 },
      { ...internalAuditUser1, expectedRecords: 9 },
    ])(
      '$RoleKey should return all users for their organisation',
      async ({ expectedRecords, ...user }) => {
        const users = await apiClient.getUsers({}, { user });
        expect(users.auth_user.length).toBe(expectedRecords);
      }
    );

    it.each([
      { field: { FirstName: true }, fieldName: 'FirstName' },
      { field: { LastName: true }, fieldName: 'LastName' },
      { field: { RoleKey: true }, fieldName: 'RoleKey' },
      { field: { Status: true }, fieldName: 'Status' },
      { field: { CreatedOn: true }, fieldName: 'CreatedOn' },
      { field: { DisplayName: true }, fieldName: 'DisplayName' },
      { field: { JobTitle: true }, fieldName: 'JobTitle' },
      { field: { Department: true }, fieldName: 'Department' },
      { field: { OfficeLocation: true }, fieldName: 'OfficeLocation' },
      { field: { CreatedByUser: true }, fieldName: 'CreatedByUser' },
      { field: { ModifiedByUser: true }, fieldName: 'ModifiedByUser' },
      {
        field: { ModifiedAtTimestamp: true },
        fieldName: 'ModifiedAtTimestamp',
      },
      {
        field: { organisationusers: true },
        fieldName: 'organisationusers',
      },
      { field: { IsCustomerSupport: true }, fieldName: 'IsCustomerSupport' },
    ])(
      'should fail when standard users request unauthorized field: $fieldName',
      async ({ field, fieldName }) => {
        const users = apiClient.getUsersWithSpecifiedFields(
          {
            Id: true,
            Email: true,
            FriendlyName: true,
            ...field,
          },
          {
            user: standardUser1,
          }
        );

        await expect(users).rejects.toThrowError(
          `field '${fieldName}' not found in type: 'auth_user'`
        );
      }
    );

    it.each([
      { field: { Id: true }, fieldName: 'Id' },
      { field: { Email: true }, fieldName: 'Email' },
      { field: { FriendlyName: true }, fieldName: 'FriendlyName' },
      { field: { LastSeen: true }, fieldName: 'LastSeen' },
      { field: { userGroups: true }, fieldName: 'userGroups' },
    ])(
      'should allow standard users to request authorized field: $fieldName',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async ({ field, fieldName }) => {
        const users = await apiClient.getUsersWithSpecifiedFields(
          {
            ...field,
          },
          {
            user: standardUser1,
          }
        );

        expect(users.auth_user.length).toBe(9);
      }
    );
  });
});
