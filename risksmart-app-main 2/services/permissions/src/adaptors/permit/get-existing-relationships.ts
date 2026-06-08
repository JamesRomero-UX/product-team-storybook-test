import type { PermitSDK } from '@risksmart-app/permitio/src/types';
import { RS_NODE_ID } from '@risksmart-app/permitio/src/types';

import type { ExistingGroupRelationship } from './process-group-relationship-changes';
import type { ExistingRoleAssignment } from './process-user-role-changes';

export interface ExistingRelationships {
  roleAssignments: ExistingRoleAssignment[];
  groupRelationships: ExistingGroupRelationship[];
}

export interface GetExistingRelationshipsParams {
  objectId: string;
  orgKey: string;
}

interface GetExistingRelationshipsDeps {
  listRoleAssignments: PermitSDK['listRoleAssignments'];
  listRelationshipTuples: PermitSDK['listRelationshipTuples'];
}

/**
 * Creates a function that fetches the current Permit state for an object
 * and returns the existing role assignments and group relationships
 * in the expected format for permission processors.
 */
export const createGetExistingRelationships =
  ({
    listRoleAssignments,
    listRelationshipTuples,
  }: GetExistingRelationshipsDeps) =>
  async ({
    objectId,
    orgKey,
  }: GetExistingRelationshipsParams): Promise<ExistingRelationships> => {
    const instanceKey = RS_NODE_ID(objectId);

    const [existingRoleAssignments, existingGroupRelationships] =
      await Promise.all([
        listRoleAssignments({
          resource_instance: instanceKey,
          tenant: orgKey,
        }),
        listRelationshipTuples({
          object: instanceKey,
          tenant: orgKey,
        }),
      ]);

    return {
      roleAssignments: existingRoleAssignments.map((a) => ({
        user: a.user,
        role: a.role,
      })),
      groupRelationships: existingGroupRelationships.map((r) => ({
        subject: r.subject,
        relation: r.relation,
      })),
    };
  };
