import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getUserGroups, insertUserGroup } from '../clients/userGroupClient';
import { buildApprovalWorkflow } from '../data/approval';
import { buildUserGroup } from '../data/userGroup';
import { buildUserGroupUser } from '../data/userGroupUser';
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

describe('userGroup', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords user groups',
      async ({ expectedRecords, ...user }) => {
        await insertUserGroup(buildUserGroup({}));

        const userGroups = await getUserGroups({
          user,
        });
        expect(userGroups.length).toEqual(expectedRecords);
      }
    );
  });

  describe('delete', () => {
    it.each([
      {
        ...riskManagerUser1,
        expectedDeletedRecords: 1,
        expectedRemainingRecords: 0,
        exception: null,
      },
      {
        ...internalAuditUser1,
        expectedDeletedRecords: 0,
        expectedRemainingRecords: 0,
        exception:
          "field 'deleteUserGroups' not found in type: 'mutation_root'",
      },
      {
        ...standardUser1,
        expectedDeletedRecords: 0,
        expectedRemainingRecords: 0,
        exception:
          "field 'deleteUserGroups' not found in type: 'mutation_root'",
      },
      {
        ...standardEnhancedUser1,
        expectedDeletedRecords: 0,
        expectedRemainingRecords: 0,
        exception:
          "field 'deleteUserGroups' not found in type: 'mutation_root'",
      },
      {
        ...readOnlyUser1,
        expectedDeletedRecords: 0,
        expectedRemainingRecords: 0,
        exception:
          "field 'deleteUserGroups' not found in type: 'mutation_root'",
      },
    ])(
      '$RoleKey should delete $expectedRecords user groups',
      async ({
        expectedDeletedRecords,
        expectedRemainingRecords,
        exception,
        ...user
      }) => {
        const userGroup = buildUserGroup({});
        await insertUserGroup(userGroup);

        if (exception) {
          await expect(
            apiClient.deleteUserGroups(
              {
                UserGroupIds: [userGroup.Id!],
              },
              {
                user,
              }
            )
          ).rejects.toThrow(exception);
        } else {
          const { deleteUserGroups } = await apiClient.deleteUserGroups(
            {
              UserGroupIds: [userGroup.Id!],
            },
            {
              user,
            }
          );
          expect(deleteUserGroups.affected_rows).toEqual(
            expectedDeletedRecords
          );
          const userGroups = await getUserGroups({
            user,
          });
          expect(userGroups.length).toEqual(expectedRemainingRecords);
        }
      }
    );

    it.each([
      {
        ...riskManagerUser1,
        expectedDeletedRecords: 0,
        expectedRemainingRecords: 1,
      },
    ])(
      '$RoleKey should delete $expectedRecords user groups when part of an approval flow',
      async ({ expectedDeletedRecords, expectedRemainingRecords, ...user }) => {
        const userGroup = buildUserGroup({
          users: {
            data: [
              buildUserGroupUser({
                UserId: standardUser1.Id,
              }),
              buildUserGroupUser({
                UserId: riskManagerUser1.Id,
              }),
            ],
          },
        });

        await apiClient.insertUserGroups({
          objects: [userGroup],
        });

        await apiClient.insertApprovals({
          objects: [
            buildApprovalWorkflow('publish-document-version', [
              [{ OwnerApprover: true }],
              [{ UserGroupId: userGroup.Id }],
            ]),
          ],
        });

        const { deleteUserGroups } = await apiClient.deleteUserGroups(
          {
            UserGroupIds: [userGroup.Id!],
          },
          {
            user,
          }
        );
        expect(deleteUserGroups.affected_rows).toEqual(expectedDeletedRecords);
        const userGroups = await getUserGroups({
          user,
        });
        expect(userGroups.length).toEqual(expectedRemainingRecords);
      }
    );
  });
});
