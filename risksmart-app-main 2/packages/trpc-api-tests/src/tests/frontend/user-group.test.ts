import {
  buildUser,
  buildUserGroup,
  buildUserGroupUser,
  deleteTestOrg,
  insertUser,
  insertUserGroup,
  insertUserGroupUser,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('user-group', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];
  const extraUserIds: string[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all([
      ...contexts.map((c) => c.cleanup()),
      ...extraUserIds.map((id) => deleteTestOrg('__noop__', id)),
    ]);
  });

  describe('userGroupById', () => {
    it('should return user group when found', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.userGroup.userGroupById.query({
        id: insertedUserGroup.Id,
      });

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedUserGroup.Id,
          Name: userGroupInput.Name,
          Description: userGroupInput.Description,
          Email: userGroupInput.Email,
          OwnerContributor: userGroupInput.OwnerContributor,
        })
      );
    });

    it('should return user group with custom name and description', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
        overrides: {
          Name: 'Custom Group Name',
          Description: 'Custom group description',
        },
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.userGroup.userGroupById.query({
        id: insertedUserGroup.Id,
      });

      expect(response.length).toEqual(1);
      expect(response[0]?.Name).toEqual('Custom Group Name');
      expect(response[0]?.Description).toEqual('Custom group description');
    });

    it('should return user group with empty approvers when none exist', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.userGroup.userGroupById.query({
        id: insertedUserGroup.Id,
      });

      expect(response.length).toEqual(1);
      expect(response[0]?.approvers).toEqual([]);
    });

    it('should return 404 error when user group not found', async () => {
      const { trpcClient } = context;

      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(
        trpcClient.frontend.userGroup.userGroupById.query({
          id: nonExistentId,
        })
      ).rejects.toThrow();
    });

    it('should not return OrgKey field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.userGroup.userGroupById.query({
        id: insertedUserGroup.Id,
      });

      expect(response.length).toEqual(1);
      expect(response[0]).not.toHaveProperty('OrgKey');
    });

    it('should return ModifiedAtTimestamp field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.userGroup.userGroupById.query({
        id: insertedUserGroup.Id,
      });

      expect(response.length).toEqual(1);
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
    });
  });

  describe('usersByGroupId', () => {
    it('should return empty users array when no users in group', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.userGroup.usersByGroupId.query(
        {
          groupId: insertedUserGroup.Id,
        }
      );

      expect(response[0]?.users).toEqual([]);
    });

    it('should return users belonging to the group', async () => {
      const { orgKey, userId, trpcClient, insertedUser } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      // Add the test context user to the group
      const userGroupUserInput = buildUserGroupUser({
        orgKey,
        userId,
        userGroupId: insertedUserGroup.Id,
        memberUserId: insertedUser!.Id,
      });
      await insertUserGroupUser(userGroupUserInput);

      const response = await trpcClient.frontend.userGroup.usersByGroupId.query(
        {
          groupId: insertedUserGroup.Id,
        }
      );

      expect(response[0]?.users.length).toEqual(1);
      expect(response[0]?.users[0]?.authUsers).toBeDefined();
    });

    it('should return multiple users in a group', async () => {
      const { orgKey, userId, trpcClient, insertedUser } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      // Create a second user
      const secondUserId = crypto.randomUUID();
      extraUserIds.push(secondUserId);
      const secondUserInput = buildUser(secondUserId);
      const secondUser = await insertUser(secondUserInput);

      if (!secondUser) {
        throw new Error('Failed to insert second user');
      }

      // Add both users to the group
      const userGroupUserInput1 = buildUserGroupUser({
        orgKey,
        userId,
        userGroupId: insertedUserGroup.Id,
        memberUserId: insertedUser!.Id,
      });
      await insertUserGroupUser(userGroupUserInput1);

      const userGroupUserInput2 = buildUserGroupUser({
        orgKey,
        userId,
        userGroupId: insertedUserGroup.Id,
        memberUserId: secondUser.Id,
      });
      await insertUserGroupUser(userGroupUserInput2);

      const response = await trpcClient.frontend.userGroup.usersByGroupId.query(
        {
          groupId: insertedUserGroup.Id,
        }
      );

      expect(response[0]?.users.length).toEqual(2);
    });

    it('should return CreatedAtTimestamp for user group membership', async () => {
      const { orgKey, userId, trpcClient, insertedUser } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const userGroupUserInput = buildUserGroupUser({
        orgKey,
        userId,
        userGroupId: insertedUserGroup.Id,
        memberUserId: insertedUser!.Id,
      });
      await insertUserGroupUser(userGroupUserInput);

      const response = await trpcClient.frontend.userGroup.usersByGroupId.query(
        {
          groupId: insertedUserGroup.Id,
        }
      );

      expect(response[0]?.users.length).toEqual(1);
      expect(response[0]?.users[0]?.CreatedAtTimestamp).toBeDefined();
    });

    it('should return createdByUser with FriendlyName', async () => {
      const { orgKey, userId, trpcClient, insertedUser } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const userGroupUserInput = buildUserGroupUser({
        orgKey,
        userId,
        userGroupId: insertedUserGroup.Id,
        memberUserId: insertedUser!.Id,
      });
      await insertUserGroupUser(userGroupUserInput);

      const response = await trpcClient.frontend.userGroup.usersByGroupId.query(
        {
          groupId: insertedUserGroup.Id,
        }
      );

      expect(response[0]?.users.length).toEqual(1);
      expect(response[0]?.users[0]?.createdByUser).toBeDefined();
    });

    it('should return 404 error when user group not found', async () => {
      const { trpcClient } = context;

      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(
        trpcClient.frontend.userGroup.usersByGroupId.query({
          groupId: nonExistentId,
        })
      ).rejects.toThrow();
    });
  });

  describe('userGroupsWithApprovers', () => {
    it('should return empty array when no user groups exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response).toEqual([]);
    });

    it('should return user groups with aggregate counts', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedUserGroup.Id,
          Name: userGroupInput.Name,
          Description: userGroupInput.Description,
          Email: userGroupInput.Email,
          OwnerContributor: userGroupInput.OwnerContributor,
        })
      );
    });

    it('should return users_aggregate count of 0 when no users in group', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      await insertUserGroup(userGroupInput);

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.users_aggregate).toEqual({
        aggregate: { count: 0 },
      });
    });

    it('should return approvers_aggregate count of 0 when no approvers', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      await insertUserGroup(userGroupInput);

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.approvers_aggregate).toEqual({
        aggregate: { count: 0 },
      });
    });

    it('should return correct users_aggregate count when users added to group', async () => {
      const { orgKey, userId, trpcClient, insertedUser } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      const insertedUserGroup = await insertUserGroup(userGroupInput);

      if (!insertedUserGroup) {
        throw new Error('Failed to insert user group');
      }

      // Add the test context user to the group
      const userGroupUserInput = buildUserGroupUser({
        orgKey,
        userId,
        userGroupId: insertedUserGroup.Id,
        memberUserId: insertedUser!.Id,
      });
      await insertUserGroupUser(userGroupUserInput);

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.users_aggregate).toEqual({
        aggregate: { count: 1 },
      });
    });

    it('should return createdByUser with FriendlyName', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      await insertUserGroup(userGroupInput);

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.createdByUser).toBeDefined();
      expect(response[0]?.createdByUser?.FriendlyName).toBeDefined();
    });

    it('should return modifiedByUser with FriendlyName', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      await insertUserGroup(userGroupInput);

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.modifiedByUser).toBeDefined();
      expect(response[0]?.modifiedByUser?.FriendlyName).toBeDefined();
    });

    it('should return CreatedAtTimestamp and ModifiedAtTimestamp', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroupInput = buildUserGroup({
        orgKey,
        userId,
      });
      await insertUserGroup(userGroupInput);

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(1);
      expect(response[0]?.CreatedAtTimestamp).toBeDefined();
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
    });

    it('should return multiple user groups', async () => {
      const { orgKey, userId, trpcClient } = context;

      const userGroup1Input = buildUserGroup({
        orgKey,
        userId,
        overrides: { Name: 'Group 1' },
      });
      const userGroup2Input = buildUserGroup({
        orgKey,
        userId,
        overrides: { Name: 'Group 2' },
      });

      await insertUserGroup(userGroup1Input);
      await insertUserGroup(userGroup2Input);

      const response =
        await trpcClient.frontend.userGroup.userGroupsWithApprovers.query();

      expect(response.length).toEqual(2);
      const names = response.map((g) => g.Name);
      expect(names).toContain('Group 1');
      expect(names).toContain('Group 2');
    });
  });
});
