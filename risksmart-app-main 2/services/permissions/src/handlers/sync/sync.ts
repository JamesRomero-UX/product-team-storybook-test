import { getEnv } from '@risksmart-app/shared/src/utils/environment';
import { getAllOrganisationsForTenant } from '@risksmart-app/tenant-configuration/src/adaptors/database/index';

import {
  type DataLayerApiClient,
  dataLayerApiClient,
} from '../../adaptors/database/data-layer-api-client';
import { createPermitDependencies } from '../../adaptors/permit/create-permit-dependencies';
import { getLogger } from '../../logger';
import {
  type OrgSyncStats,
  type PermitTenant,
  type TenantSyncStats,
} from './common';
import { PermitService } from './permit.service';
import { parseAllPermitData } from './permit-all-data-parser';
import { createOrgCreatorHandler } from './permit-org-creator';
import { createOwnershipSyncHandler } from './permit-ownership-sync';
import { createRelationshipSyncHandler } from './permit-relationship-sync';
import { createResourceInstanceSyncHandler } from './permit-resource-instance-sync';
import { createUserGroupSyncHandler } from './permit-user-group-sync';
import { createUserSyncHandler } from './permit-user-sync';

const logger = getLogger();

const SYSTEM_USER_ID = 'SYSTEM';

// Helper function to create dependency injected handlers for an org
const createOrgSyncHandlers = (deps: {
  dataLayerClient: DataLayerApiClient;
  tenant: string;
  orgKey: string;
  orgStats: OrgSyncStats;
  orgLogger: ReturnType<typeof getLogger>;
  permitOrg: PermitTenant | undefined;
  permitService: PermitService;
}) => {
  const {
    dataLayerClient,
    tenant,
    orgKey,
    orgStats,
    orgLogger,
    permitOrg,
    permitService,
  } = deps;

  return {
    userGroupSync: createUserGroupSyncHandler({
      userGroupRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getUserGroups(
          tenant,
          orgKey,
          SYSTEM_USER_ID
        );
      },
      userGroupUserRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getUserGroupUsers(
          tenant,
          orgKey,
          SYSTEM_USER_ID
        );
      },
      userGroupCreator: async (groupId: string, orgKey: string) => {
        return permitService.userGroupCreator(groupId, orgKey, orgLogger);
      },
      userGroupUserAssigner: async (
        groupId: string,
        userId: string,
        orgKey: string
      ) => {
        return await permitService.userGroupUserAssigner(
          groupId,
          userId,
          orgKey,
          orgLogger
        );
      },
      userGroupUserRemover: async (
        groupId: string,
        userId: string,
        orgKey: string
      ) => {
        return await permitService.userGroupUserRemover(
          groupId,
          userId,
          orgKey,
          orgLogger
        );
      },
      userGroupDeleter: async (groupId: string) => {
        return await permitService.userGroupDeleter(groupId, orgLogger);
      },
      orgKey,
      orgStats,
      orgLogger,
      permitOrg,
    }),

    resourceInstanceSync: createResourceInstanceSyncHandler({
      nodeRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getNodes(tenant, orgKey, SYSTEM_USER_ID);
      },
      resourceInstanceCreator: async (
        input: {
          key: string;
          tenant: string;
          resource: string;
          attributes: {
            ObjectType: string;
          };
        }[]
      ) => {
        return await permitService.resourceInstanceCreator(
          orgKey,
          orgLogger,
          input
        );
      },
      resourceInstanceRemover: async (keys: string[]) => {
        return await permitService.resourceInstanceRemover(
          orgKey,
          orgLogger,
          keys
        );
      },
      orgKey,
      orgStats,
      orgLogger,
      permitOrg,
    }),

    relationshipSync: createRelationshipSyncHandler({
      linkedItemRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getLinkedItems(
          tenant,
          orgKey,
          SYSTEM_USER_ID
        );
      },
      ownerGroupRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getOwnerGroups(
          tenant,
          orgKey,
          SYSTEM_USER_ID
        );
      },
      contributorGroupRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getContributorGroups(
          tenant,
          orgKey,
          SYSTEM_USER_ID
        );
      },
      relationshipTupleCreator: async (
        tuples: {
          object: string;
          relation: string;
          subject: string;
          tenant: string;
        }[]
      ) => {
        return await permitService.relationshipCreator(
          tuples,
          orgKey,
          orgLogger
        );
      },
      relationshipTupleRemover: async (
        tuples: {
          object: string;
          relation: string;
          subject: string;
        }[]
      ) => {
        return await permitService.relationshipRemover(
          tuples,
          orgKey,
          orgLogger
        );
      },
      orgKey,
      orgStats,
      orgLogger,
      permitOrg,
    }),

    ownershipSync: createOwnershipSyncHandler({
      userRoleRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getUserRoles(
          tenant,
          orgKey,
          SYSTEM_USER_ID
        );
      },
      ownerRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getOwners(tenant, orgKey, SYSTEM_USER_ID);
      },
      contributorRetriever: async (_orgKey: string) => {
        return await dataLayerClient.getContributors(
          tenant,
          orgKey,
          SYSTEM_USER_ID
        );
      },
      roleAssigner: async (
        roleAssignmentsToCreate: {
          resource_instance: string | undefined;
          role: string;
          tenant: string;
          user: string;
        }[]
      ) => {
        await permitService.roleAssigner(
          roleAssignmentsToCreate,
          orgKey,
          orgLogger
        );
      },
      roleRemover: async (
        roleAssignmentsToRemove: {
          resource_instance: string | undefined;
          role: string;
          tenant: string;
          user: string;
        }[]
      ) => {
        await permitService.roleRemover(
          roleAssignmentsToRemove,
          orgKey,
          orgLogger
        );
      },
      orgKey,
      orgStats,
      orgLogger,
      permitOrg,
    }),
  };
};

export const sync = async (syncSettings: { tenant: string }): Promise<void> => {
  const syncStartTime = Date.now();
  const permitDeps = await createPermitDependencies(logger);

  const permitService = new PermitService(permitDeps);
  logger.info('Starting Permit sync', {
    syncSettings,
  });

  const { permitTenants, permitOrgMap, permitUserMap, unassignedUsers } =
    await parseAllPermitData(logger, permitService);

  const failedOrgs: {
    orgKey: string;
    tenant: string;
    error: string;
  }[] = [];
  const tenantSyncOutputs: TenantSyncStats[] = [];
  for (const tenant of [syncSettings]) {
    const tenantLogger = logger.createChild({
      persistentKeys: { tenant: tenant.tenant },
    });
    // Initialize stats object for this tenant
    const tenantStats: TenantSyncStats = {
      tenant: tenant.tenant,
      usersCreated: 0,
      usersDeleted: 0,
      orgStats: [],
      timeMs: 0,
    };
    try {
      tenantLogger.info('Processing tenant', { tenant: tenant.tenant });

      const tenantOrgs = await getAllOrganisationsForTenant(
        getEnv('AWS_REGION'),
        tenant.tenant
      );
      tenantLogger.info('Got organisations for tenant', {
        orgCount: tenantOrgs.length,
      });

      if (tenantOrgs.length > 0) {
        tenantLogger.info('Filtering orgs to process', {
          tenant: tenant.tenant,
          orgKeys: tenantOrgs.map((o) => o.orgKey),
        });

        // Process resource instances and their relations for each org
        for (const orgKey of tenantOrgs.map((o) => o.orgKey)) {
          const orgStartTime = Date.now();

          const { executeOrgCreation } = createOrgCreatorHandler({
            orgRetriever: async () => {
              return await dataLayerApiClient.getOrganisations(
                tenant.tenant,
                orgKey,
                SYSTEM_USER_ID
              );
            },
            orgCreator: async (
              input: {
                key: string;
                name: string;
                description: string;
                attributes: Record<string, unknown>;
              }[]
            ) => await permitService.orgCreator(input, tenantLogger),
            tenantLogger,
            permitOrgMap,
            tenantOrgs: tenantOrgs.map((o) => o.orgKey),
          });
          const { createdOrgs } = await executeOrgCreation();

          const { executeUserSync: executeUserCreation } =
            createUserSyncHandler({
              userRetriever: async () => {
                return await dataLayerApiClient.getUsers(
                  tenant.tenant,
                  orgKey,
                  SYSTEM_USER_ID
                );
              },
              userCreator: async (userIds: string[]) =>
                await permitService.userCreator(userIds, tenantLogger),
              syncStats: tenantStats,
              tenantLogger,
              permitUserMap,
              unassignedUsers,
            });
          await executeUserCreation();

          try {
            const orgLogger = tenantLogger.createChild({
              persistentKeys: {
                org: orgKey,
              },
            });

            // Initialize stats object for this org
            const orgStats: OrgSyncStats = {
              orgKey: orgKey,
              tenant: tenant.tenant,
              resourceInstancesCreated: 0,
              resourceInstancesDeleted: 0,
              relationshipTuplesCreated: 0,
              relationshipTuplesDeleted: 0,
              userGroupsCreated: 0,
              userGroupsDeleted: 0,
              ownershipAssigned: 0,
              ownershipRemoved: 0,
              userGroupUsersAssigned: 0,
              userGroupUsersRemoved: 0,
              timeMs: 0,
            };

            const createdOrg = createdOrgs.some((o) => o.OrgKey === orgKey);
            const permitOrg = permitTenants.get(orgKey);
            if (!permitOrg && !createdOrg) {
              orgLogger.info(
                'No permit data found for org and not created this sync, skipping',
                { orgKey }
              );
              continue;
            } else if (createdOrg) {
              orgLogger.info('Org was created this sync', { orgKey });
            }

            // Create all handlers for this org
            const {
              userGroupSync,
              resourceInstanceSync,
              relationshipSync,
              ownershipSync,
            } = createOrgSyncHandlers({
              dataLayerClient: dataLayerApiClient,
              tenant: tenant.tenant,
              orgKey,
              orgStats,
              orgLogger,
              permitOrg,
              permitService,
            });
            // Execute all sync operations
            await userGroupSync.executeUserSync();

            // Create/delete resource instances (Permit.io will cascade-delete relationships)
            const { relationshipTuples, deletedResourceSet } =
              await resourceInstanceSync.executeResourceInstanceSync();

            // Pass deletedResourceSet so relationship sync can skip trying to delete their relationships
            // Reusing the Set avoids duplicate construction for millions of records
            await relationshipSync.executeRelationshipSync(
              relationshipTuples,
              deletedResourceSet
            );

            // Pass deletedResourceSet so ownership sync can skip trying to unassign roles for deleted resources
            await ownershipSync.executeOwnershipSync(deletedResourceSet);

            // Org complete
            const orgEndTime = Date.now();
            orgStats.timeMs = orgEndTime - orgStartTime;

            orgLogger.info('Completed processing org', {
              orgKey,
              timeMs: orgStats.timeMs,
            });
            tenantStats.timeMs += orgStats.timeMs;
            tenantStats.orgStats.push({ ...orgStats });
          } catch (error) {
            const orgEndTime = Date.now();
            const orgTimeMs = orgEndTime - orgStartTime;
            tenantStats.timeMs += orgTimeMs;
            tenantLogger.error('Failed to process org, skipping to next', {
              error,
              orgKey,
              timeMs: orgTimeMs,
            });
            failedOrgs.push({
              orgKey: orgKey,
              tenant: tenant.tenant,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      } else {
        tenantLogger.info('No org keys found for tenant, skipping', {
          tenant: tenant.tenant,
        });
      }
    } catch (error) {
      tenantLogger.error('Failed to process tenant, skipping to next', {
        error,
      });
      failedOrgs.push({
        orgKey: 'N/A',
        tenant: tenant.tenant,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    tenantSyncOutputs.push(tenantStats);
  }

  const syncEndTime = Date.now();
  const totalSyncTimeMs = syncEndTime - syncStartTime;

  logger.info('Permit sync completed', {
    totalSyncTimeMs,
    totalSyncTimeSeconds: Math.round(totalSyncTimeMs / 1000),
    totalTenantsProcessed: tenantSyncOutputs.length,
    totalOrgsProcessed: tenantSyncOutputs.reduce(
      (sum, tenant) => sum + tenant.orgStats.length,
      0
    ),
    averageOrgTimeMs:
      tenantSyncOutputs.reduce(
        (sum, tenant) => sum + tenant.orgStats.length,
        0
      ) > 0
        ? Math.round(
            tenantSyncOutputs
              .flatMap((c) => c.orgStats)
              .reduce((sum, org) => sum + org.timeMs, 0) /
              tenantSyncOutputs.reduce(
                (sum, tenant) => sum + tenant.orgStats.length,
                0
              )
          )
        : 0,
    averageTenantTimeMs:
      tenantSyncOutputs.length > 0
        ? Math.round(
            tenantSyncOutputs.reduce((sum, tenant) => sum + tenant.timeMs, 0) /
              tenantSyncOutputs.length
          )
        : 0,
  });

  if (failedOrgs.length > 0) {
    logger.warn('Some orgs failed to sync during the Permit sync', {
      failedOrgs,
    });
  }

  if (tenantSyncOutputs.length > 0) {
    for (const tenantOutput of tenantSyncOutputs) {
      logger.info('Processed tenant', {
        tenant: tenantOutput.tenant,
        orgsProcessed: tenantOutput.orgStats.length,
      });
      for (const orgStat of tenantOutput.orgStats) {
        logger.info('Processed org results', {
          tenant: tenantOutput.tenant,
          orgStat,
        });
      }
    }
  }
};
