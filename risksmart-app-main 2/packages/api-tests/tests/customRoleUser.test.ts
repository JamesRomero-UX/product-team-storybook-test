import { randomUUID } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { insertUserOrganisation } from '../clients/userOrganisationClient';
import { buildCustomRole } from '../data/customRole';
import { buildCustomRoleUser } from '../data/customRoleUser';
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

describe('custom role user', () => {
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
        const user1Id = randomUUID();
        await apiClient.insertUser({
          objects: [
            {
              UserName: 'New User 1',
              RoleKey: 'Standard',
              Id: user1Id,
            },
          ],
        });
        await insertUserOrganisation({
          objects: [
            {
              OrgKey: getDefaultOrgId(),
              User_Id: user1Id,
            },
          ],
        });
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        await apiClient.insertCustomRoleUser({
          input: buildCustomRoleUser({
            CustomRoleId: insert_custom_role_one!.Id,
            UserId: user1Id,
          }),
        });
        const result = await apiClient.getAllCustomRoleUsers(
          {},
          {
            user,
          }
        );
        expect(result.custom_role_user.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([standardUser1])(
      'When $RoleKey tries to delete a custom role user, it denies permission',
      async (user) => {
        const user1Id = randomUUID();
        await apiClient.insertUser({
          objects: [
            {
              UserName: 'New User 1',
              RoleKey: 'Standard',
              Id: user1Id,
            },
          ],
        });
        await insertUserOrganisation({
          objects: [
            {
              OrgKey: getDefaultOrgId(),
              User_Id: user1Id,
            },
          ],
        });
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        const result = await apiClient.insertCustomRoleUser({
          input: buildCustomRoleUser({
            CustomRoleId: insert_custom_role_one!.Id,
            UserId: user1Id,
          }),
        });

        await expect(
          apiClient.deleteCustomRoleUser(
            {
              filter: {
                Id: { _eq: result.insert_custom_role_user_one!.Id },
              },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'delete_custom_role_user' not found in type: 'mutation_root'"
        );
      }
    );
    it.each([customerSupportUser1, riskManagerUser1])(
      'When $RoleKey tries to delete a custom role user, it deletes successfully',
      async (user) => {
        const user1Id = randomUUID();
        await apiClient.insertUser({
          objects: [
            {
              UserName: 'New User 1',
              RoleKey: 'Standard',
              Id: user1Id,
            },
          ],
        });
        await insertUserOrganisation({
          objects: [
            {
              OrgKey: getDefaultOrgId(),
              User_Id: user1Id,
            },
          ],
        });
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        const result = await apiClient.insertCustomRoleUser({
          input: buildCustomRoleUser({
            CustomRoleId: insert_custom_role_one!.Id,
            UserId: user1Id,
          }),
        });

        const data = await apiClient.deleteCustomRoleUser(
          {
            filter: {
              Id: { _eq: result.insert_custom_role_user_one!.Id },
            },
          },
          {
            user,
          }
        );
        expect(data?.delete_custom_role_user?.affected_rows).toEqual(1);
      }
    );
  });

  describe('insert', () => {
    it.each([standardUser1])(
      'When $RoleKey tries to insert a custom role user, it denies permission',
      async (user) => {
        const { insert_custom_role_one } = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        const user1Id = randomUUID();
        await apiClient.insertUser({
          objects: [
            {
              UserName: 'New User 1',
              RoleKey: 'Standard',
              Id: user1Id,
            },
          ],
        });
        await insertUserOrganisation({
          objects: [
            {
              OrgKey: getDefaultOrgId(),
              User_Id: user1Id,
            },
          ],
        });
        await expect(
          apiClient.insertCustomRoleUser(
            {
              input: {
                ...buildCustomRoleUser({
                  CustomRoleId: insert_custom_role_one!.Id,
                  UserId: user1Id,
                }),
              },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'insert_custom_role_user_one' not found in type: 'mutation_root'"
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
    ])('$RoleKey can not update custom role user', async ({ ...user }) => {
      const { insert_custom_role_one } = await apiClient.insertCustomRole({
        input: buildCustomRole({}),
      });
      const user1Id = randomUUID();
      const user2Id = randomUUID();
      await apiClient.insertUser({
        objects: [
          {
            UserName: 'New User 1',
            RoleKey: 'Standard',
            Id: user1Id,
          },
          {
            UserName: 'New User 2',
            RoleKey: 'Standard',
            Id: user2Id,
          },
        ],
      });
      await insertUserOrganisation({
        objects: [
          {
            OrgKey: getDefaultOrgId(),
            User_Id: user1Id,
          },
          {
            OrgKey: getDefaultOrgId(),
            User_Id: user2Id,
          },
        ],
      });
      const result = await apiClient.insertCustomRoleUser({
        input: buildCustomRoleUser({
          CustomRoleId: insert_custom_role_one!.Id,
          UserId: user1Id,
        }),
      });

      await expect(
        apiClient.updateCustomRoleUser(
          {
            filter: {
              Id: { _eq: result.insert_custom_role_user_one!.Id },
            },
            updateInput: { UserId: user2Id },
          },
          {
            user,
          }
        )
      ).rejects.toThrow(
        "field 'update_custom_role_user' not found in type: 'mutation_root'"
      );
    });
  });
});
