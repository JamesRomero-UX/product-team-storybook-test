import { randomUUID } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { insertUserOrganisation } from '../clients/userOrganisationClient';
import { buildCustomRole } from '../data/customRole';
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

describe('custom role', () => {
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
        await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });
        const result = await apiClient.getAllCustomRoles(
          {},
          {
            user,
          }
        );
        expect(result.custom_role.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      { ...customerSupportUser1, deletedRecords: 1 },
      { ...riskManagerUser1, deletedRecords: 1 },
    ])(
      'When $RoleKey deletes a custom role, it deletes $deletedRecords records',
      async ({ deletedRecords, ...user }) => {
        const result = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });

        const data = await apiClient.deleteCustomRole(
          {
            filter: { Id: { _eq: result.insert_custom_role_one!.Id } },
          },
          {
            user,
          }
        );
        expect(data?.delete_custom_role?.affected_rows).toEqual(deletedRecords);
      }
    );

    it.each([standardUser1])(
      'When $RoleKey tries to delete a custom role, it denies permission',
      async (user) => {
        const result = await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });

        await expect(
          apiClient.deleteCustomRole(
            {
              filter: { Id: { _eq: result.insert_custom_role_one!.Id } },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'delete_custom_role' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('insert', () => {
    it.each([{ ...customerSupportUser1 }, { ...riskManagerUser1 }])(
      'When $RoleKey insert a custom role, it inserts records',
      async ({ ...user }) => {
        await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });

        const data = await apiClient.insertCustomRoleCustomAction(
          {
            input: {
              Name: 'New Role',
              RoleKeys: ['RiskManager', 'ControlManager'],
              UserIds: [],
            },
          },
          {
            user,
          }
        );
        expect(data?.customRoleInsert?.Id).toBeDefined();
      }
    );

    it.each([{ ...customerSupportUser1 }, { ...riskManagerUser1 }])(
      'When $RoleKey insert a custom role, it inserts records and assigns the underlying user roles',
      async ({ ...user }) => {
        await apiClient.insertCustomRole({
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

        const users = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1 = users.auth_user.find((c) => c.Id === user1Id);
        expect(user1?.userRoles?.length).toEqual(0);
        const user2 = users.auth_user.find((c) => c.Id === user2Id);
        expect(user2?.userRoles?.length).toEqual(0);

        const data = await apiClient.insertCustomRoleCustomAction(
          {
            input: {
              Name: 'New Role',
              RoleKeys: ['RiskManager', 'ControlManager'],
              UserIds: [user1Id, user2Id],
            },
          },
          {
            user,
          }
        );
        expect(data?.customRoleInsert?.Id).toBeDefined();
        const updatedUsers = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1Updated = updatedUsers.auth_user.find(
          (c) => c.Id === user1Id
        );
        expect(user1Updated?.userRoles?.length).toEqual(2);
        expect(user1Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'RiskManager'
        );
        expect(user1Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'ControlManager'
        );
        const user2Updated = updatedUsers.auth_user.find(
          (c) => c.Id === user2Id
        );
        expect(user2Updated?.userRoles?.length).toEqual(2);
        expect(user2Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'RiskManager'
        );
        expect(user2Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'ControlManager'
        );
      }
    );

    it.each([{ ...customerSupportUser1 }, { ...riskManagerUser1 }])(
      'When $RoleKey insert a custom role, it inserts records and assigns the underlying user roles as a combination of existing and new roles',
      async ({ ...user }) => {
        await apiClient.insertCustomRole({
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

        const users = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1 = users.auth_user.find((c) => c.Id === user1Id);
        expect(user1?.userRoles?.length).toEqual(0);
        const user2 = users.auth_user.find((c) => c.Id === user2Id);
        expect(user2?.userRoles?.length).toEqual(0);

        const data = await apiClient.insertCustomRoleCustomAction(
          {
            input: {
              Name: 'New Role 1',
              RoleKeys: ['RiskManager', 'ControlManager'],
              UserIds: [user1Id, user2Id],
            },
          },
          {
            user,
          }
        );
        expect(data?.customRoleInsert?.Id).toBeDefined();
        const updatedUsers = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1Updated = updatedUsers.auth_user.find(
          (c) => c.Id === user1Id
        );
        expect(user1Updated?.userRoles?.length).toEqual(2);
        expect(user1Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'RiskManager'
        );
        expect(user1Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'ControlManager'
        );
        const user2Updated = updatedUsers.auth_user.find(
          (c) => c.Id === user2Id
        );
        expect(user2Updated?.userRoles?.length).toEqual(2);
        expect(user2Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'RiskManager'
        );
        expect(user2Updated?.userRoles?.map((r) => r.RoleKey)).toContain(
          'ControlManager'
        );

        const secondInsertData = await apiClient.insertCustomRoleCustomAction(
          {
            input: {
              Name: 'New Role 2',
              RoleKeys: ['PolicyManager', 'SettingsManager'],
              UserIds: [user1Id, user2Id],
            },
          },
          {
            user,
          }
        );
        expect(secondInsertData?.customRoleInsert?.Id).toBeDefined();

        const updatedUsersAgain = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1UpdatedAgain = updatedUsersAgain.auth_user.find(
          (c) => c.Id === user1Id
        );
        expect(user1UpdatedAgain?.userRoles?.length).toEqual(4);
        expect(user1UpdatedAgain?.userRoles?.map((r) => r.RoleKey)).toContain(
          'RiskManager'
        );
        expect(user1UpdatedAgain?.userRoles?.map((r) => r.RoleKey)).toContain(
          'ControlManager'
        );
        expect(user1UpdatedAgain?.userRoles?.map((r) => r.RoleKey)).toContain(
          'PolicyManager'
        );
        expect(user1UpdatedAgain?.userRoles?.map((r) => r.RoleKey)).toContain(
          'SettingsManager'
        );
        const user2UpdatedAgain = updatedUsersAgain.auth_user.find(
          (c) => c.Id === user2Id
        );
        expect(user2UpdatedAgain?.userRoles?.length).toEqual(4);
        expect(user2UpdatedAgain?.userRoles?.map((r) => r.RoleKey)).toContain(
          'PolicyManager'
        );
        expect(user2UpdatedAgain?.userRoles?.map((r) => r.RoleKey)).toContain(
          'SettingsManager'
        );
      }
    );

    it.each([standardUser1])(
      'When $RoleKey tries to insert a custom role, it denies permission',
      async (user) => {
        await apiClient.insertCustomRole({
          input: buildCustomRole({}),
        });

        await expect(
          apiClient.insertCustomRoleCustomAction(
            {
              input: {
                Name: 'New Role',
                RoleKeys: ['RiskManager', 'ControlManager'],
                UserIds: [],
              },
            },
            {
              user,
            }
          )
        ).rejects.toThrow(
          "field 'customRoleInsert' not found in type: 'mutation_root'"
        );
      }
    );
  });

  describe('update', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...standardEnhancedUser1, expectedRecords: 0 },
      { ...internalAuditUser1, expectedRecords: 0 },
    ])(
      '$RoleKey can update $expectedRecords custom role',
      async ({ expectedRecords, ...user }) => {
        const result = await apiClient.insertCustomRole({
          input: buildCustomRole({
            RoleName: 'Original Name',
          }),
        });

        if (expectedRecords === 0) {
          await expect(
            apiClient.updateCustomRoleCustomAction(
              {
                input: {
                  Id: result.insert_custom_role_one!.Id,
                  Name: 'New Name',
                  RoleKeys: [],
                  UserIds: [],
                },
              },
              {
                user,
              }
            )
          ).rejects.toThrow(
            "field 'customRoleUpdate' not found in type: 'mutation_root'"
          );

          return;
        }

        const data = await apiClient.updateCustomRoleCustomAction(
          {
            input: {
              Id: result.insert_custom_role_one!.Id,
              Name: 'New Name',
              RoleKeys: ['RiskManager', 'ControlManager'],
              UserIds: [],
            },
          },
          {
            user,
          }
        );

        expect(data?.customRoleUpdate?.affected_rows).toEqual(expectedRecords);
      }
    );

    it.each([{ ...riskManagerUser1 }, { ...customerSupportUser1 }])(
      '$RoleKey role updates a custom role and modifies the underlying user roles - adding new role assignments',
      async ({ ...user }) => {
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

        const users = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1 = users.auth_user.find((c) => c.Id === user1Id);
        expect(user1?.userRoles?.length).toEqual(0);
        const user2 = users.auth_user.find((c) => c.Id === user2Id);
        expect(user2?.userRoles?.length).toEqual(0);

        const result = await apiClient.insertCustomRole({
          input: buildCustomRole({
            RoleName: 'Original Name',
            customRoleAssignments: {
              data: [{ RoleTypeKey: 'RiskManager', OrgKey: getDefaultOrgId() }],
            },
            OrgKey: getDefaultOrgId(),
            customRoleUsers: {
              data: [
                { UserId: user1Id, OrgKey: getDefaultOrgId() },
                { UserId: user2Id, OrgKey: getDefaultOrgId() },
              ],
            },
          }),
        });

        const userUpdated = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1Updated = userUpdated.auth_user.find(
          (c) => c.Id === user1Id
        );
        expect(user1Updated?.userRoles?.length).toEqual(1);
        const user2Updated = userUpdated.auth_user.find(
          (c) => c.Id === user2Id
        );
        expect(user2Updated?.userRoles?.length).toEqual(1);

        await apiClient.updateCustomRoleCustomAction(
          {
            input: {
              Id: result.insert_custom_role_one!.Id,
              Name: 'New Name',
              RoleKeys: ['RiskManager', 'ControlManager'],
              UserIds: [user1Id, user2Id],
            },
          },
          {
            user,
          }
        );

        const userUpdatedAgain = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1UpdatedAgain = userUpdatedAgain.auth_user.find(
          (c) => c.Id === user1Id
        );
        expect(user1UpdatedAgain?.userRoles?.length).toEqual(2);
        expect(user1UpdatedAgain?.userRoles?.map((c) => c.RoleKey)).toEqual(
          expect.arrayContaining(['RiskManager', 'ControlManager'])
        );
        const user2UpdatedAgain = userUpdatedAgain.auth_user.find(
          (c) => c.Id === user2Id
        );
        expect(user2UpdatedAgain?.userRoles?.length).toEqual(2);
        expect(user2UpdatedAgain?.userRoles?.map((c) => c.RoleKey)).toEqual(
          expect.arrayContaining(['RiskManager', 'ControlManager'])
        );
      }
    );

    it.each([{ ...riskManagerUser1 }, { ...customerSupportUser1 }])(
      '$RoleKey role updates a custom role and modifies the underlying user roles - removing role assignments',
      async ({ ...user }) => {
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

        const users = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1 = users.auth_user.find((c) => c.Id === user1Id);
        expect(user1?.userRoles?.length).toEqual(0);
        const user2 = users.auth_user.find((c) => c.Id === user2Id);
        expect(user2?.userRoles?.length).toEqual(0);

        const result = await apiClient.insertCustomRole({
          input: buildCustomRole({
            RoleName: 'Original Name',
            customRoleAssignments: {
              data: [
                { RoleTypeKey: 'RiskManager', OrgKey: getDefaultOrgId() },
                { RoleTypeKey: 'ControlManager', OrgKey: getDefaultOrgId() },
              ],
            },
            OrgKey: getDefaultOrgId(),
            customRoleUsers: {
              data: [
                { UserId: user1Id, OrgKey: getDefaultOrgId() },
                { UserId: user2Id, OrgKey: getDefaultOrgId() },
              ],
            },
          }),
        });

        const userUpdated = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1Updated = userUpdated.auth_user.find(
          (c) => c.Id === user1Id
        );
        expect(user1Updated?.userRoles?.length).toEqual(2);
        const user2Updated = userUpdated.auth_user.find(
          (c) => c.Id === user2Id
        );
        expect(user2Updated?.userRoles?.length).toEqual(2);

        await apiClient.updateCustomRoleCustomAction(
          {
            input: {
              Id: result.insert_custom_role_one!.Id,
              Name: 'New Name',
              RoleKeys: ['RiskManager'],
              UserIds: [user1Id, user2Id],
            },
          },
          {
            user,
          }
        );

        const userUpdatedAgain = await apiClient.getUsersWithSpecifiedFields({
          Id: true,
          userRoles: true,
        });

        const user1UpdatedAgain = userUpdatedAgain.auth_user.find(
          (c) => c.Id === user1Id
        );
        expect(user1UpdatedAgain?.userRoles?.length).toEqual(1);
        expect(user1UpdatedAgain?.userRoles?.map((c) => c.RoleKey)).toEqual(
          expect.arrayContaining(['RiskManager'])
        );
        const user2UpdatedAgain = userUpdatedAgain.auth_user.find(
          (c) => c.Id === user2Id
        );
        expect(user2UpdatedAgain?.userRoles?.length).toEqual(1);
        expect(user2UpdatedAgain?.userRoles?.map((c) => c.RoleKey)).toEqual(
          expect.arrayContaining(['RiskManager'])
        );
      }
    );
  });
});
