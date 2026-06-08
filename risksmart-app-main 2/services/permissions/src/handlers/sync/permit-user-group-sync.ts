import type { Logger } from '@aws-lambda-powertools/logger';

import { userGroupId } from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';

type UserGroupRetriever = (orgKey: string) => Promise<
  {
    Id: string;
    OrgKey: string;
    Name: string;
    Description: string | null;
  }[]
>;

type UserGroupUserRetriever = (orgKey: string) => Promise<
  {
    OrgKey: string;
    UserGroupId: string;
    UserId: string;
  }[]
>;

type UserGroupCreator = (groupId: string, orgKey: string) => Promise<void>;

type UserGroupUserAssigner = (
  groupId: string,
  userId: string,
  orgKey: string
) => Promise<void>;

type UserGroupUserRemover = (
  groupId: string,
  userId: string,
  orgKey: string
) => Promise<void>;

type UserGroupDeleter = (groupId: string) => Promise<void>;

interface Dependencies {
  userGroupRetriever: UserGroupRetriever;
  userGroupUserRetriever: UserGroupUserRetriever;
  userGroupCreator: UserGroupCreator;
  userGroupUserAssigner: UserGroupUserAssigner;
  userGroupUserRemover: UserGroupUserRemover;
  userGroupDeleter: UserGroupDeleter;
  orgKey: string;
  orgStats: OrgSyncStats;
  orgLogger: Logger;
  permitOrg: PermitTenant | undefined;
}

export const createUserGroupSyncHandler = (dependencies: Dependencies) => {
  const syncExecutor = async () => {
    await executeUserGroupSync(dependencies);
  };

  return {
    executeUserSync: syncExecutor,
  };
};

export const executeUserGroupSync = async (input: Dependencies) => {
  const {
    userGroupRetriever,
    userGroupUserRetriever,
    userGroupCreator,
    userGroupUserAssigner,
    userGroupUserRemover,
    userGroupDeleter,
    orgKey,
    orgStats,
    orgLogger,
    permitOrg,
  } = input;
  orgLogger.info('Processing org user groups', {
    orgKey,
    permitOrgExists: !!permitOrg,
  });

  const userGroups = await userGroupRetriever(orgKey);

  orgLogger.info('Got user groups from DB', {
    userGroupCount: userGroups.length,
  });
  const permitUserGroups = permitOrg
    ? Array.from(permitOrg.ResourceInstances.values()).filter(
        (ri) => ri.InstanceType === 'user_group'
      )
    : [];

  orgLogger.info('Got user groups from Permit', {
    permitUserGroupCount: permitUserGroups.length,
  });
  // Use a Set for O(1) lookups
  const existingPermitUserGroupsSet = new Set(
    permitUserGroups.map((group) => group.Id)
  );

  const groupsToCreate = userGroups.filter(
    (group) => !existingPermitUserGroupsSet.has(group.Id)
  );

  // Create a Set of userGroup Ids for efficient lookups
  const userGroupIdsSet = new Set(userGroups.map((group) => group.Id));

  const groupsToDelete = permitUserGroups.filter(
    (group) => !userGroupIdsSet.has(group.Id)
  );

  orgLogger.info('Creating user groups.', {
    userGroupsToCreateCount: groupsToCreate.length,
  });

  for (const group of groupsToCreate) {
    orgLogger.info('creating user group', {
      id: group.Id,
      orgKey: group.OrgKey,
    });

    await userGroupCreator(group.Id, group.OrgKey);
  }
  orgLogger.info('Created groups.');

  // Update sync stats for user groups created
  orgStats.userGroupsCreated += groupsToCreate.length;

  const userGroupUsers = await userGroupUserRetriever(orgKey);
  orgLogger.info('Retrieved user group users from DB', {
    userGroupUserCount: userGroupUsers.length,
  });
  const permitUserGroupUsers = permitOrg
    ? Array.from(permitOrg.ResourceInstances.values())
        .filter((ri) => ri.InstanceType === 'user_group')
        .flatMap((group) =>
          Array.from(permitOrg.Users.entries())
            .filter(([_, user]) =>
              user.RoleAssignments.some(
                (ra) => ra.ResourceInstanceId === userGroupId(group.Id)
              )
            )
            .map(([_, user]) => ({
              OrgKey: orgKey,
              UserGroupId: group.Id,
              UserId: user.Id,
            }))
        )
    : [];

  orgLogger.info('Got user group users from Permit', {
    userGroupUserCount: userGroupUsers.length,
  });
  const existingPermitUserGroupUserSet = new Set(
    permitUserGroupUsers.map(
      (ugu) => `${ugu.UserGroupId}::${ugu.UserId}::${ugu.OrgKey}`
    )
  );

  const newUserGroupUsers = userGroupUsers.filter(
    (ugu) =>
      !existingPermitUserGroupUserSet.has(
        `${ugu.UserGroupId}::${ugu.UserId}::${ugu.OrgKey}`
      )
  );

  orgLogger.info('Assigning users to groups.', {
    userGroupUserCount: newUserGroupUsers.length,
  });
  for (const groupUser of newUserGroupUsers) {
    orgLogger.info('adding user to group', {
      userId: groupUser.UserId,
      groupId: groupUser.UserGroupId,
      orgKey: groupUser.OrgKey,
    });

    await userGroupUserAssigner(
      groupUser.UserGroupId,
      groupUser.UserId,
      groupUser.OrgKey
    );
  }
  orgLogger.info('Assigned users to groups.');

  // Update sync stats for user group users assigned
  orgStats.userGroupUsersAssigned += newUserGroupUsers.length;

  orgLogger.info('Created groups and assigned users.', {
    userGroupCount: groupsToCreate.length,
    userGroupUserCount: newUserGroupUsers.length,
  });

  // Now handle removals
  const userGroupUsersToRemove = permitUserGroupUsers.filter(
    (ugu) =>
      !userGroupUsers.some(
        (dbUgu) =>
          dbUgu.UserGroupId === ugu.UserGroupId &&
          dbUgu.UserId === ugu.UserId &&
          dbUgu.OrgKey === ugu.OrgKey &&
          // Ensure we don't remove users from groups that are being deleted
          groupsToDelete.some((g) => g.Id === ugu.UserGroupId) === false
      )
  );

  orgLogger.info('Removing users from groups.', {
    userGroupUserCount: userGroupUsersToRemove.length,
  });
  for (const groupUser of userGroupUsersToRemove) {
    orgLogger.info('removing user from group', {
      userId: groupUser.UserId,
      groupId: groupUser.UserGroupId,
      orgKey: groupUser.OrgKey,
    });

    await userGroupUserRemover(
      groupUser.UserGroupId,
      groupUser.UserId,
      groupUser.OrgKey
    );
  }
  orgLogger.info('Removed users from groups.');

  // Update sync stats for user group users removed
  orgStats.userGroupUsersRemoved += userGroupUsersToRemove.length;

  if (groupsToDelete.length > 0) {
    orgLogger.info('Deleting user groups.', {
      userGroupCount: groupsToDelete.length,
    });
    for (const group of groupsToDelete) {
      orgLogger.info('delete user group', {
        id: group.Id,
      });
      await userGroupDeleter(group.Id);
    }
    orgLogger.info('Deleted user groups.');

    // Update sync stats for user groups deleted
    orgStats.userGroupsDeleted += groupsToDelete.length;
  } else {
    orgLogger.info('No user groups to delete.');
  }
};
