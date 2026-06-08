import type { Logger } from '@aws-lambda-powertools/logger';

import {
  type ResourceInstanceId,
  rootResourceInstanceId,
  rsNodeId,
} from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';
import { getRoleAssignmentKey } from './common';

type OwnerRetriever = (orgKey: string) => Promise<
  {
    OrgKey: string;
    CreatedAtTimestamp: string;
    CreatedByUser: string;
    ModifiedByUser: string;
    ModifiedAtTimestamp: string;
    UserId: string;
    ParentId: string;
    parentNode: {
      OrgKey: string;
      Id: string;
      ObjectType: string;
      SequentialId: number | null;
    } | null;
  }[]
>;

type ContributorRetriever = (orgKey: string) => Promise<
  {
    OrgKey: string;
    CreatedAtTimestamp: string;
    CreatedByUser: string;
    ModifiedByUser: string;
    ModifiedAtTimestamp: string;
    UserId: string;
    ParentId: string;
    parentNode: {
      OrgKey: string;
      Id: string;
      ObjectType: string;
      SequentialId: number | null;
    } | null;
  }[]
>;

type UserRoleRetriever = (orgKey: string) => Promise<
  {
    Id: string;
    OrgKey: string;
    ModifiedByUser: string;
    ModifiedAtTimestamp: string;
    UserId: string;
    RoleKey: string;
    CreatedAtTimestamp: string;
    CreatedByUser: string | null;
    role_type: {
      RoleKey: string;
      Name: string;
      RiskSmartInternal: boolean;
      TopLevelRoleKey: string;
      InstanceRoleKey: string | null;
      Description: string | null;
      resourceTypes: {
        RoleKey: string;
        ResourceType: string;
      }[];
    } | null;
  }[]
>;

type RoleAssigner = (
  inputs: {
    resource_instance: string | undefined;
    role: string;
    tenant: string;
    user: string;
  }[]
) => Promise<void>;

type RoleRemover = (
  inputs: {
    resource_instance: string | undefined;
    role: string;
    tenant: string;
    user: string;
  }[]
) => Promise<void>;

interface Dependencies {
  ownerRetriever: OwnerRetriever;
  contributorRetriever: ContributorRetriever;
  userRoleRetriever: UserRoleRetriever;
  roleAssigner: RoleAssigner;
  roleRemover: RoleRemover;
  orgKey: string;
  orgStats: OrgSyncStats;
  orgLogger: Logger;
  permitOrg: PermitTenant | undefined;
}

export const createOwnershipSyncHandler = (dependencies: Dependencies) => {
  const syncExecutor = async (
    deletedResourceSet: ReadonlySet<ResourceInstanceId>
  ) => {
    await executeOwnershipSync(dependencies, deletedResourceSet);
  };

  return {
    executeOwnershipSync: syncExecutor,
  };
};

export const executeOwnershipSync = async (
  input: Dependencies,
  deletedResourceSet: ReadonlySet<ResourceInstanceId>
) => {
  const {
    roleAssigner,
    roleRemover,
    userRoleRetriever,
    ownerRetriever,
    contributorRetriever,
    orgKey,
    orgStats,
    orgLogger,
    permitOrg,
  } = input;
  orgLogger.info('Starting role assignments.', {
    orgKey: input.orgKey,
    permitOrgExists: !!permitOrg,
  });
  // Assign permit ownership
  let roleAssignments: Array<{
    resource_instance: string | undefined;
    role: string;
    tenant: string;
    user: string;
  }> = [];

  const topLevelRoleAssignmentData = await userRoleRetriever(orgKey);

  orgLogger.info('Got top level role assignments from DB', {
    topLevelRoleAssignmentDataCount: topLevelRoleAssignmentData.length,
  });

  const topLevelRoleAssignments = topLevelRoleAssignmentData
    .filter((c) => c.role_type?.InstanceRoleKey)
    .flatMap(
      (topLevelRole) =>
        topLevelRole.role_type?.resourceTypes.map((rt) => ({
          resource_instance: rootResourceInstanceId(
            rt.ResourceType,
            topLevelRole.OrgKey
          ),
          role: topLevelRole.role_type!.InstanceRoleKey!,
          tenant: topLevelRole.OrgKey,
          user: topLevelRole.UserId,
        })) ?? []
    );
  orgLogger.info('Mapped top role assignments from DB', {
    topLevelRoleAssignmentCount: topLevelRoleAssignments.length,
  });

  // Use concat instead of spread to avoid stack overflow with large arrays
  roleAssignments = roleAssignments.concat(topLevelRoleAssignments);

  const userRoleAssignments = topLevelRoleAssignmentData
    .filter((topLevelRole) => topLevelRole.role_type?.TopLevelRoleKey)
    .map((topLevelRole) => ({
      resource_instance: undefined,
      role: topLevelRole.role_type!.TopLevelRoleKey,
      tenant: topLevelRole.OrgKey,
      user: topLevelRole.UserId,
    }));
  orgLogger.info('Got user role assignments from DB', {
    userRoleAssignments: userRoleAssignments.length,
  });

  // Use concat instead of spread to avoid stack overflow with large arrays
  roleAssignments = roleAssignments.concat(userRoleAssignments);

  const owners = await ownerRetriever(orgKey);

  orgLogger.info('Got owners from DB', {
    ownerCount: owners.length,
  });

  // Use concat instead of spread to avoid stack overflow with large arrays
  roleAssignments = roleAssignments.concat(
    owners.map((owner) => ({
      resource_instance: rsNodeId(owner.parentNode!.Id),
      role: 'Owner',
      tenant: owner.OrgKey,
      user: owner.UserId,
    }))
  );

  const contributors = await contributorRetriever(orgKey);

  orgLogger.info('Got contributors from DB', {
    contributorCount: contributors.length,
  });

  // Use concat instead of spread to avoid stack overflow with large arrays
  roleAssignments = roleAssignments.concat(
    contributors.map((contributor) => ({
      resource_instance: rsNodeId(contributor.parentNode!.Id),
      role: 'Contributor',
      tenant: contributor.OrgKey,
      user: contributor.UserId,
    }))
  );

  orgLogger.info('Total role assignments to process from permit', {
    permitOrgExists: !!permitOrg,
    totalUsers: permitOrg ? permitOrg.Users.length : 0,
  });

  const existingRoleAssignments = permitOrg
    ? Array.from(permitOrg.Users.entries()).flatMap(([_, user]) => [
        // Resource-specific role assignments
        ...user.RoleAssignments.flatMap((ra) =>
          // Filter out 'member' roles as they are implicit
          ra.Roles.filter((c) => c != 'member').map((role) => ({
            resource_instance: ra.ResourceInstanceId,
            role: role,
            tenant: ra.OrgKey,
            user: user.Id,
          }))
        ),
        // Top-level roles (without resource instance)
        ...user.Roles.map((role) => ({
          resource_instance: undefined,
          role: role,
          tenant: orgKey,
          user: user.Id,
        })),
      ])
    : [];

  orgLogger.info('Got existing role assignments from Permit', {
    existingRoleAssignmentCount: existingRoleAssignments.length,
  });

  // Create a Set of assignment keys for O(1) lookups
  const existingRoleAssignmentKeysSet = new Set(
    existingRoleAssignments.map(getRoleAssignmentKey)
  );

  // Create a Set of DB assignment keys for O(1) lookups
  const dbRoleAssignmentKeysSet = new Set(
    roleAssignments.map(getRoleAssignmentKey)
  );

  const roleAssignmentsToCreate = roleAssignments.filter(
    (roleAssignment) =>
      !existingRoleAssignmentKeysSet.has(getRoleAssignmentKey(roleAssignment))
  );

  if (roleAssignmentsToCreate.length > 0) {
    orgLogger.info('Bulk assigning roles', {
      roleAssignmentCount: roleAssignmentsToCreate.length,
    });
    await roleAssigner(roleAssignmentsToCreate);
  } else {
    orgLogger.info('No role assignments to create.');
  }
  orgLogger.info('Completed role assignments.', { orgKey });
  orgStats.ownershipAssigned += roleAssignmentsToCreate.length;

  // Use the provided Set of deleted resource IDs for O(1) lookups
  // This Set was already constructed in resource instance sync to avoid duplicate work

  // Create a set of assignment keys that exist in permit but do not exist in our DB
  const roleAssignmentsToRemove = existingRoleAssignments.filter(
    (roleAssignment) =>
      !dbRoleAssignmentKeysSet.has(getRoleAssignmentKey(roleAssignment))
  );

  // Filter out role assignments for deleted resources - Permit.io cascade-deletes them
  const normalRoleAssignmentsToRemove = roleAssignmentsToRemove.filter(
    (ra) =>
      !ra.resource_instance || !deletedResourceSet.has(ra.resource_instance)
  );

  const skippedCascadeDeleteCount =
    roleAssignmentsToRemove.length - normalRoleAssignmentsToRemove.length;

  if (skippedCascadeDeleteCount > 0) {
    orgLogger.info(
      'Skipping unassignment of roles for deleted resources (Permit.io will cascade-delete them)',
      {
        skippedCount: skippedCascadeDeleteCount,
      }
    );
  }

  if (normalRoleAssignmentsToRemove.length > 0) {
    orgLogger.info('Bulk unassigning roles', {
      roleAssignmentsToRemoveCount: normalRoleAssignmentsToRemove.length,
    });
    await roleRemover(normalRoleAssignmentsToRemove);
  } else {
    orgLogger.info('No role assignments to remove.');
  }
  orgLogger.info('Completed role assignment removal.', { orgKey });

  // Update sync stats for ownership removed
  orgStats.ownershipRemoved += normalRoleAssignmentsToRemove.length;
};
