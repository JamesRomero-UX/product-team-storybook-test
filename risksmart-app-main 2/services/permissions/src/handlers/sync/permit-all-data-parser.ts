import type { Logger } from '@aws-lambda-powertools/logger';

import {
  buildResourceInstanceId,
  instanceTypePrefixSchema,
  parseResourceInstanceId,
  type ResourceInstanceId,
} from './branded-ids';
import type { PermitTenant } from './common';
import type { PermitService } from './permit.service';

export const parseAllPermitData = async (
  logger: Logger,
  permitService: PermitService
) => {
  const allPermitData = await permitService.getAllData();

  if (!allPermitData) {
    throw new Error('Failed to fetch data from Permit');
  }

  // Pre-allocate Maps with appropriate sizes for better performance
  const permitUserMap = new Map(
    allPermitData.users ? Object.entries(allPermitData.users) : []
  );

  const permitOrgMap = new Map(
    allPermitData.tenants ? Object.entries(allPermitData.tenants ?? {}) : []
  );

  const permitResourceInstanceMap = new Map(
    allPermitData.resource_instances
      ? Object.entries(allPermitData.resource_instances)
      : []
  );

  const permitRoleAssignmentMap = new Map(
    allPermitData.role_assignments
      ? Object.entries(allPermitData.role_assignments)
      : []
  );

  const permitRelationshipMap = new Map(
    allPermitData.relationships
      ? Object.entries(allPermitData.relationships)
      : []
  );

  logger.info('Fetched all permit data', {
    userCount: permitUserMap.size,
    resourceInstanceCount: permitResourceInstanceMap.size,
    roleAssignmentCount: permitRoleAssignmentMap.size,
    tenantCount: permitOrgMap.size,
    relationshipCount: permitRelationshipMap.size,
  });

  // Pre-build tenant-to-resource mapping for O(1) lookups during user processing
  const tenantResourceMap = new Map<string, Set<string>>();
  for (const [instanceId, instanceData] of permitResourceInstanceMap) {
    const tenantResources = tenantResourceMap.get(instanceData.tenant);
    if (tenantResources) {
      tenantResources.add(instanceId);
    } else {
      tenantResourceMap.set(instanceData.tenant, new Set([instanceId]));
    }
  }

  // Initialize tenants with pre-allocated structures
  const permitTenants: Map<string, PermitTenant> = new Map();
  for (const [tenantKey, _] of permitOrgMap) {
    permitTenants.set(tenantKey, {
      OrgKey: tenantKey,
      Users: [],
      ResourceInstances: new Map(),
    });
  }

  // Track users without any organisation assignments
  const unassignedUsers = new Set<string>();

  // Process users and resource instances in parallel for better performance
  const userProcessingPromises: Promise<void>[] = [];
  const resourceProcessingPromises: Promise<void>[] = [];

  // Batch process users to avoid blocking the event loop
  const userEntries = Array.from(permitUserMap.entries());
  const BATCH_SIZE = 1000; // Process in batches to prevent memory spikes

  for (let i = 0; i < userEntries.length; i += BATCH_SIZE) {
    const batch = userEntries.slice(i, i + BATCH_SIZE);
    userProcessingPromises.push(
      Promise.resolve().then(() => {
        for (const [userId, userData] of batch) {
          parseUserDataOptimized(
            logger,
            userId,
            userData,
            permitTenants,
            permitRoleAssignmentMap,
            tenantResourceMap,
            unassignedUsers
          );
        }
      })
    );
  }

  // Batch process resource instances
  const resourceEntries = Array.from(permitResourceInstanceMap.entries());

  for (let i = 0; i < resourceEntries.length; i += BATCH_SIZE) {
    const batch = resourceEntries.slice(i, i + BATCH_SIZE);
    resourceProcessingPromises.push(
      Promise.resolve().then(() => {
        for (const [instanceId, instanceData] of batch) {
          parseResourceInstanceDataOptimized(
            logger,
            instanceId,
            instanceData,
            permitTenants,
            permitRelationshipMap
          );
        }
      })
    );
  }

  // Wait for all processing to complete
  await Promise.all([...userProcessingPromises, ...resourceProcessingPromises]);

  logger.info('Parsed permit data', {
    tenantCount: permitTenants.size,
    unassignedUserCount: unassignedUsers.size,
  });

  return {
    permitTenants,
    permitUserMap,
    permitOrgMap,
    permitResourceInstanceMap,
    permitRoleAssignmentMap,
    permitRelationshipMap,
    unassignedUsers,
  };
};

export const parseResourceInstanceDataOptimized = (
  logger: Logger,
  instanceId: string,
  instanceData: {
    tenant: string;
    attributes: {
      ObjectType: string | undefined;
    };
  },
  permitTenants: Map<string, PermitTenant>,
  permitRelationshipMap: Map<
    string,
    {
      [relation: string]: {
        [targetKey: string]: string[];
      };
    }
  >
) => {
  const tenant = permitTenants.get(instanceData.tenant);
  if (!tenant) {
    return;
  } // Early exit if tenant not found

  const parsed = parseResourceInstanceId(instanceId);
  if (!parsed) {
    logger.warn('Invalid resource instance ID format, skipping', {
      instanceId,
    });

    return;
  }

  const typedInstanceId = buildResourceInstanceId(
    parsed.instanceType,
    parsed.id
  );

  const nodeRelations = permitRelationshipMap.get(instanceId);
  const relations: { Subject: ResourceInstanceId; Relation: string }[] = [];

  if (nodeRelations) {
    // Pre-allocate array to avoid dynamic resizing
    const relationEntries = Object.entries(nodeRelations);
    for (let i = 0; i < relationEntries.length; i++) {
      const relationEntry = relationEntries[i]!;
      const [relation, targets] = relationEntry;
      const splitRelationKey = relation.split(':');
      const relationName = splitRelationKey[1];

      if (!relationName) {
        logger.warn('Invalid relation format, skipping', { relation });
        continue;
      }

      const targetEntries = Object.entries(targets);
      for (let j = 0; j < targetEntries.length; j++) {
        const targetEntry = targetEntries[j]!;
        const [targetType, targetData] = targetEntry;
        const parsedTargetType = instanceTypePrefixSchema.safeParse(targetType);
        if (!parsedTargetType.success) {
          logger.warn('Unknown resource instance type prefix, skipping', {
            targetType,
          });
          continue;
        }
        for (let k = 0; k < targetData.length; k++) {
          relations.push({
            Subject: buildResourceInstanceId(
              parsedTargetType.data,
              targetData[k]!
            ),
            Relation: relationName,
          });
        }
      }
    }
  }

  tenant.ResourceInstances.set(typedInstanceId, {
    InstanceType: parsed.instanceType,
    Id: parsed.id,
    OrgKey: tenant.OrgKey,
    ObjectType: instanceData.attributes.ObjectType,
    Relations: relations,
  });
};

export const parseUserDataOptimized = (
  logger: Logger,
  userId: string,
  userData: {
    roleAssignments: {
      [orgKey: string]: string[];
    };
    attributes: {
      key: string;
    };
  },
  permitTenants: Map<string, PermitTenant>,
  permitRoleAssignmentMap: Map<
    string,
    {
      [nodeId: string]: string[];
    }
  >,
  tenantResourceMap: Map<string, Set<string>>,
  unassignedUserIds?: Set<string>
) => {
  // Check if user has no organisation assignments (empty roleAssignments object)
  const hasOrgAssignments =
    userData.roleAssignments &&
    Object.keys(userData.roleAssignments).length > 0;

  if (!hasOrgAssignments) {
    // Capture user without any organisation assignments
    if (unassignedUserIds) {
      unassignedUserIds.add(userId);
    }

    return;
  }

  const userKey = `user:${userId}`;
  const roleAssignments = permitRoleAssignmentMap.get(userKey);

  // Pre-filter role assignments once instead of filtering for each tenant
  let filteredRoleAssignments: Array<[string, string[]]> | null = null;
  if (roleAssignments) {
    filteredRoleAssignments = Object.entries(roleAssignments).filter(
      (c) => !c[0].startsWith('__tenant')
    );
  }
  if (!filteredRoleAssignments) {
    logger.info('No role assignments found for user', {
      userId,
    });

    return;
  }

  const roleAssignmentEntries = Object.entries(userData.roleAssignments);
  for (let i = 0; i < roleAssignmentEntries.length; i++) {
    const [tenantKey, roles] = roleAssignmentEntries[i]!;
    const tenant = permitTenants.get(tenantKey);

    if (!tenant) {
      logger.warn('Tenant not found for user role assignment, skipping', {
        tenantKey,
        userId,
      });
      continue;
    }

    // Use the pre-built tenant resource mapping for O(1) lookups
    const tenantResources = tenantResourceMap.get(tenantKey);
    const tenantFilteredAssignments = tenantResources
      ? filteredRoleAssignments.filter((c) => tenantResources.has(c[0]))
      : [];

    const permitUser = {
      Id: userId,
      Roles: roles,
      OrgKey: tenantKey,
      RoleAssignments: tenantFilteredAssignments.flatMap((ra) => {
        const parsed = parseResourceInstanceId(ra[0]);
        if (!parsed) {
          logger.warn(
            'Invalid resource instance ID in role assignment, skipping',
            {
              rawId: ra[0],
            }
          );

          return [];
        }

        return [
          {
            Roles: ra[1],
            ResourceInstanceId: buildResourceInstanceId(
              parsed.instanceType,
              parsed.id
            ),
            OrgKey: tenantKey,
          },
        ];
      }),
    };

    tenant.Users.push(permitUser);
  }
};

export const parseUserData = (
  logger: Logger,
  userId: string,
  userData: {
    roleAssignments: {
      [orgKey: string]: string[];
    };
    attributes: {
      key: string;
    };
  },
  permitTenants: Map<string, PermitTenant>,
  permitRoleAssignmentMap: Map<
    string,
    {
      [nodeId: string]: string[];
    }
  >,
  permitResourceInstanceMap?: Map<
    string,
    {
      tenant: string;
      attributes: {
        ObjectType: string | undefined;
      };
    }
  >
) => {
  if (!userData.roleAssignments) {
    return;
  }
  for (const [tenantKey, roles] of Object.entries(
    userData.roleAssignments ?? {}
  )) {
    const tenant = permitTenants.get(tenantKey);
    const roleAssignments = permitRoleAssignmentMap.get(`user:${userId}`);
    if (tenant) {
      if (roleAssignments) {
        const userRoleAssignments = Object.entries(roleAssignments);
        const permitUser = {
          Id: userId,
          Roles: roles,
          RoleAssignments: userRoleAssignments
            // Filter out user <> tenant assignment keys as they cause odd behavior
            .filter((c) => !c[0].startsWith('__tenant'))
            // Filter to only include role assignments that belong to the current tenant
            .filter((c) => {
              // For resource assignments (rs_node, user_group, contributor_group, owner_group),
              // check if they belong to this tenant using the resource instance map
              if (permitResourceInstanceMap) {
                const resourceInstance = permitResourceInstanceMap.get(c[0]);
                if (resourceInstance) {
                  return resourceInstance.tenant === tenantKey;
                }
                // If resource instance not found, exclude it to be safe

                return false;
              }
              // When no resource instance map is provided, exclude all assignments to be safe
              // This prevents potential cross-tenant contamination

              return false;
            })
            .flatMap((ra) => {
              const parsed = parseResourceInstanceId(ra[0]);
              if (!parsed) {
                logger.warn(
                  'Invalid resource instance ID in role assignment, skipping',
                  {
                    rawId: ra[0],
                  }
                );

                return [];
              }

              return [
                {
                  Roles: ra[1],
                  ResourceInstanceId: buildResourceInstanceId(
                    parsed.instanceType,
                    parsed.id
                  ),
                  OrgKey: tenantKey,
                },
              ];
            }),
        };
        tenant.Users.push(permitUser);
      } else {
        logger.warn('No role assignments found for user', {
          tenantKey,
          userId,
        });
      }
    } else {
      logger.warn('Tenant not found for user role assignment, skipping', {
        tenantKey,
        userId,
      });
    }
  }
};
