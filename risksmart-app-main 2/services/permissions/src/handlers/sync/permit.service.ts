import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';
import type {
  Permit,
  RoleAssignmentCreate,
  RoleAssignmentRemove,
} from 'permitio';

import type { PermitDependencies } from '../../types';
import { processBatches } from '../../utils/batch';

// The API limits given below are referenced from Permit.io documentation
// https://docs.permit.io/how-to/bulk-operations/
export class PermitService {
  private permit: Permit;
  private permitRsSDK: PermitSDK;

  constructor(deps: PermitDependencies) {
    this.permit = deps.permit;
    this.permitRsSDK = deps.permitRsSDK;
  }

  async roleRemover(
    roleAssignmentsToRemove: RoleAssignmentRemove[],
    orgKey: string,
    orgLogger: Logger
  ) {
    await processBatches(
      roleAssignmentsToRemove,
      async (batch, percentComplete) => {
        orgLogger.info('Bulk unassigning roles in Permit', {
          batchCount: batch.length,
          orgKey: orgKey,
          percentComplete,
        });

        await this.permit.api.roleAssignments.bulkUnassign(
          batch.map((ra) => ({
            resource_instance: ra.resource_instance,
            role: ra.role,
            tenant: ra.tenant,
            user: ra.user,
          }))
        );
      },
      2000,
      1,
      10
    );
  }

  async roleAssigner(
    roleAssignmentsToCreate: RoleAssignmentCreate[],
    orgKey: string,
    orgLogger: Logger
  ) {
    await processBatches(
      roleAssignmentsToCreate,
      async (batch, percentComplete) => {
        orgLogger.info('Bulk assigning roles in Permit', {
          batchCount: batch.length,
          orgKey: orgKey,
          percentComplete,
        });

        await this.permit.api.roleAssignments.bulkAssign(batch);
      },
      2000,
      1,
      10
    );
  }

  async relationshipCreator(
    relationshipTuplesToCreate: {
      object: string;
      relation: string;
      subject: string;
      tenant: string;
    }[],
    orgKey: string,
    orgLogger: Logger
  ) {
    await processBatches(
      relationshipTuplesToCreate,
      async (batch, percentComplete) => {
        orgLogger.info('Creating relationship tuples in Permit', {
          batchCount: batch.length,
          orgKey: orgKey,
          percentComplete,
        });

        await this.permit.api.relationshipTuples.bulkRelationshipTuples(batch);
      },
      1000,
      1,
      10
    ); // Rate limit to 10 requests per minute
  }

  async relationshipRemover(
    relationshipTuplesToDelete: {
      object: string;
      relation: string;
      subject: string;
    }[],
    orgKey: string,
    orgLogger: Logger
  ) {
    await processBatches(
      relationshipTuplesToDelete,
      async (batch, percentComplete) => {
        orgLogger.info('Deleting relationship tuples in Permit', {
          batchCount: batch.length,
          orgKey: orgKey,
          percentComplete,
        });

        await this.permit.api.relationshipTuples.bulkUnRelationshipTuples(
          batch.map((tuple) => ({
            subject: tuple.subject,
            relation: tuple.relation,
            object: tuple.object,
          }))
        );
      },
      1000,
      1,
      10
    ); // Rate limit to 10 requests per minute
  }

  async resourceInstanceRemover(
    orgKey: string,
    orgLogger: Logger,
    resourceKeysToDelete: string[]
  ) {
    await processBatches(
      resourceKeysToDelete,
      async (batch, percentComplete) => {
        orgLogger.info('Deleting resource instances', {
          orgKey: orgKey,
          batchCount: batch.length,
          percentComplete,
        });
        await this.permitRsSDK.bulkDeleteResourceInstances(batch);
      },
      3000,
      1,
      10
    ); // Rate limit to 10 requests per minute
  }

  async resourceInstanceCreator(
    orgKey: string,
    orgLogger: Logger,
    resourcesToCreate: {
      key: string;
      tenant: string;
      resource: string;
      attributes: {
        ObjectType: string;
      };
    }[]
  ) {
    await processBatches(
      resourcesToCreate,
      async (batch, percentComplete) => {
        {
          orgLogger.info('Creating resource instances', {
            percentComplete,
          });

          return await this.permitRsSDK.bulkReplaceResourceInstances(batch);
        }
      },
      3000,
      1,
      10
    ); // Rate limit to 10 requests per minute
  }

  async userCreator(usersToCreate: string[], tenantLogger: Logger) {
    await processBatches(
      usersToCreate,
      async (batch, percentComplete) => {
        tenantLogger.info('Creating users in Permit', {
          batchCount: batch.length,
          percentComplete,
        });

        return await this.permitRsSDK.bulkCreateUsers(
          batch.map((userId) => ({
            key: userId,
            role_assignments: [],
            attributes: {},
          }))
        );
      },
      3000,
      1,
      10
    ); // Rate limit to 10 requests per minute
  }

  async userGroupCreator(groupId: string, orgKey: string, orgLogger: Logger) {
    orgLogger.info('Creating user group in Permit', {
      groupId: groupId,
    });
    await this.permitRsSDK.createGroup(groupId, orgKey);
  }

  async userGroupUserAssigner(
    groupId: string,
    userId: string,
    orgKey: string,
    orgLogger: Logger
  ) {
    orgLogger.info('Adding user to group in Permit', {
      groupId: groupId,
      userId: userId,
    });
    await this.permitRsSDK.addUserToGroup(groupId, userId, orgKey);
  }

  async userGroupUserRemover(
    groupId: string,
    userId: string,
    orgKey: string,
    orgLogger: Logger
  ) {
    orgLogger.info('Removing user from group in Permit', {
      groupId: groupId,
      userId: userId,
    });
    await this.permitRsSDK.removeUserFromGroup(groupId, userId, orgKey);
  }

  async userGroupDeleter(groupId: string, orgLogger: Logger) {
    orgLogger.info('Deleting user group in Permit', {
      groupId: groupId,
    });
    await this.permitRsSDK.deleteGroup(groupId);
  }

  async getAllData() {
    const allPermitData = await this.permitRsSDK.getAllDataOptimized();

    if (!allPermitData) {
      throw new Error('Failed to retrieve data from Permit');
    }

    return allPermitData;
  }

  async orgCreator(
    orgsToCreate: {
      key: string;
      name: string;
      description: string;
      attributes: Record<string, unknown>;
    }[],
    tenantLogger: Logger
  ) {
    await processBatches(
      orgsToCreate.map((org) => ({
        key: org.key,
        name: org.name,
        description: org.description,
        attributes: org.attributes,
      })),
      async (batch, percentComplete) => {
        tenantLogger.info('Creating tenants in Permit', {
          batchCount: batch.length,
          percentComplete,
        });

        return await this.permitRsSDK.bulkCreateTenants(batch);
      },
      2000,
      1,
      10 // Rate limit to 10 requests per minute
    );
  }
}
