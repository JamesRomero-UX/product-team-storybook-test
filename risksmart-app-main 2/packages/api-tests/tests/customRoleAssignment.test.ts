import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildCustomRole } from '../data/customRole';
import { buildCustomRoleAssignment } from '../data/customRoleAssignment';
import {
  customerSupportUser1,
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

describe('custom role assignment', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords',
      async ({ expectedRecords, ...user }) => {
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        await apiClient.insertCustomRoleAssignment({
          input: buildCustomRoleAssignment({
            CustomRoleId: insert_custom_role_one!.Id,
            RoleTypeKey: 'RiskManager',
          }),
        });
        const result = await apiClient.getAllCustomRoleAssignments(
          {},
          {
            user,
          }
        );
        expect(result.custom_role_assignment.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([standardUser1])(
      'When $RoleKey tries to delete a custom role assignment, it denies permission',
      async (user) => {
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        const result = await apiClient.insertCustomRoleAssignment({
          input: buildCustomRoleAssignment({
            CustomRoleId: insert_custom_role_one!.Id,
            RoleTypeKey: 'RiskManager',
          }),
        });

        await expect(
          apiClient.deleteCustomRoleAssignment(
            {
              filter: {
                Id: { _eq: result.insert_custom_role_assignment_one!.Id },
              },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'delete_custom_role_assignment' not found in type: 'mutation_root'"
        );
      }
    );
    it.each([customerSupportUser1, riskManagerUser1])(
      'When $RoleKey tries to delete a custom role assignment, it deletes successfully',
      async (user) => {
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        const result = await apiClient.insertCustomRoleAssignment({
          input: buildCustomRoleAssignment({
            CustomRoleId: insert_custom_role_one!.Id,
            RoleTypeKey: 'RiskManager',
          }),
        });

        const data = await apiClient.deleteCustomRoleAssignment(
          {
            filter: {
              Id: { _eq: result.insert_custom_role_assignment_one!.Id },
            },
          },
          {
            user,
          }
        );
        expect(data?.delete_custom_role_assignment?.affected_rows).toEqual(1);
      }
    );
  });

  describe('insert', () => {
    it.each([standardUser1])(
      'When $RoleKey tries to insert a custom role assignment, it denies permission',
      async (user) => {
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        await expect(
          apiClient.insertCustomRoleAssignment(
            {
              input: {
                ...buildCustomRoleAssignment({
                  CustomRoleId: insert_custom_role_one!.Id,
                  RoleTypeKey: 'RiskManager',
                }),
              },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_custom_role_assignment_one' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1 },
      { ...customerSupportUser1 },
      { ...standardUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey can not update custom role assignment',
      async ({ ...user }) => {
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        const result = await apiClient.insertCustomRoleAssignment({
          input: buildCustomRoleAssignment({
            CustomRoleId: insert_custom_role_one!.Id,
            RoleTypeKey: 'RiskManager',
          }),
        });

        await expect(
          apiClient.updateCustomRoleAssignment(
            {
              filter: {
                Id: { _eq: result.insert_custom_role_assignment_one!.Id },
              },
              updateInput: { RoleTypeKey: 'ControlManager' },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'update_custom_role_assignment' not found in type: 'mutation_root'"
        );
      }
    );
  });
});
