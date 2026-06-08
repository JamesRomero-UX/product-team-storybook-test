import { z } from 'zod';

/**
 * Root object types that represent top-level entities in the permissions model.
 * These represent nodes in our graph that will sit at the top with n children.
 * e.g a risk is a root node as it can exist with owners and is associated with the risk roles.
 * This list is tied to roles and should only be iterated on if a new node type is being added
 * that requires any nodes representing that object to be attached to a role.
 * If you are unsure about adding to this list, consult someone familiar with this pattern.
 *
 * IMPORTANT: When adding a new resource type that is associated with a role
 * (in roles.tf via resourceTypes), it MUST also be added here. The permissions
 * sync creates a root resource instance (`rs_node:{type}-{orgKey}`) for each
 * entry and assigns top-level role assignments against it. If a type is
 * referenced by a role but missing from this list, the sync will repeatedly
 * create and delete its resource instance and role assignments on every run.
 *
 * Checklist for adding a new root object type:
 * 1. Define the resource in packages/permitio/resources.tf
 * 2. Add it to the relevant roles in packages/permitio/roles.tf
 * 3. Add it to this array
 */
export const rootObjectTypes = [
  'risk',
  'action',
  'control',
  'control_group',
  'issue',
  'obligation',
  'obligation_change',
  'document',
  'third_party',
  'assessment',
  'indicator',
  'internal_audit_entity',
  'internal_audit_report',
  'custom_datasource',
];

export const ROOT_RESOURCE_ID = (type: string, orgKey: string) =>
  `${type}-${orgKey}`;

export const RS_NODE_ID = (id: string) => `rs_node:${id}`;

export const isRootObjectType = (objectType: string) => {
  return rootObjectTypes.includes(objectType);
};

// A map of all users, tenants, roles, relationships, resource instances, and role assignments
export interface GetAllDataResult {
  // users: A map of user IDs to their details
  users: {
    // The user ID
    [userId: string]: {
      roleAssignments: {
        // The organization key (tenant) with an array of RoleKeys assigned to the user
        [orgKey: string]: string[];
      };
      attributes: {
        key: string;
        email?: string | null;
      };
    };
  };
  // tenants: A map of tenant keys to their details
  tenants: {
    // The tenant key (organization key)
    [tenantKey: string]: {
      attributes: object;
    };
  };
  // roles: A map of role keys to their details
  roles: {
    // The role key
    [roleKey: string]: {
      grants: {
        // The resource type with an array of permissions granted by the role
        [resourceType: string]: string[];
      };
    };
  };
  // relationships: A map of relationships between nodes
  relationships: {
    // The node key
    // e.g. rs_node:3ef09bce-b85c-48c4-b919-9d543c791ca4
    [nodeKey: string]: {
      // The relation type with a map of target node keys and their associated relationship attributes
      // e.g. relation:rs_parent or relation:contributor or relation:owner
      [relation: string]: {
        // the type of the resource with an array of target node keys
        // e.g rs_node with an array like ["action-org_uetyetkstmubLOW9", "73ab88b9-d3ca-43cd-8fb0-c2a9a7d217e7"]
        // e.g owner_group with an array like ["5bdce249-61b4-40e0-8336-3d086e15de64"]
        [targetKey: string]: string[];
      };
    };
  };
  // resource_instances: A map of resource instance IDs to their details
  resource_instances: {
    // The resource instance ID
    // e.g. rs_node:action-org_uetyetkstmubLOW9
    [nodeId: string]: {
      // The tenant (organization key) the resource instance belongs to
      tenant: string;
      // Attributes of the resource instance
      attributes: {
        // The object type, this is mandatory for rs_nodes
        ObjectType: string | undefined;
      };
    };
  };
  // role_assignments: A map of user IDs to their role assignments
  role_assignments: {
    // The user ID
    // e.g user:auth0|644151242c766a09dd585d29
    [userId: string]: {
      // The role assignment IDs assigned to the user
      // e.g rs_node:73cef9f0-0659-4d77-8879-fb71dfab6cf9 with an array of role keys ["Owner", "Contributor"]
      [nodeId: string]: string[];
    };
  };
}

export interface PermitSDK {
  createGroup: (groupKey: string, orgKey: string) => Promise<void>;
  /**
   * Try to create a user group, silently ignoring if the group already exists (409 Conflict).
   * This is an optimistic approach that avoids the existence check API call.
   */
  tryCreateUserGroup: (userGroupKey: string, orgKey: string) => Promise<void>;
  resourceInstanceExists: (
    key: string,
    resource: string,
    orgKey: string
  ) => Promise<boolean>;
  relationshipTupleExists: (
    params: RelationshipTupleExistsParams
  ) => Promise<boolean>;
  /**
   * List relationship tuples matching the specified filters.
   * At minimum, tenant must be provided. Optionally filter by object, subject, or relation.
   * Relationship Tuples cover parent-child relationships as well as group assignments.
   */
  listRelationshipTuples: (
    params: ListRelationshipTuplesParams
  ) => Promise<RelationshipTuple[]>;
  /**
   * List role assignments matching the specified filters.
   * At minimum, tenant must be provided. Optionally filter by resource_instance, user, or role.
   */
  listRoleAssignments: (
    params: ListRoleAssignmentsParams
  ) => Promise<RoleAssignment[]>;
  /**
   * Try to create a resource instance, returning the created resource or null if it already exists (409 Conflict).
   * This is an optimistic approach that avoids the existence check API call (~375ms savings).
   */
  tryCreateResourceInstance: (
    params: ResourceInstanceCreateParams
  ) => Promise<boolean>;
  /**
   * Try to delete a resource instance, returning true if deleted, false if not found (404 Not Found).
   * This is an optimistic approach that avoids the existence check API call.
   */
  tryDeleteResourceInstance: (
    params: ResourceInstanceDeleteParams
  ) => Promise<void>;
  /**
   * Try to create a relationship tuple, silently ignoring if already exists (409 Conflict).
   * This is an optimistic approach that avoids the existence check API call (~126ms savings).
   */
  tryCreateRelationshipTuple: (
    params: RelationshipTupleCreateParams
  ) => Promise<void>;
  /**
   * Try to delete a relationship tuple, silently ignoring if not found (404 Not Found).
   * This is an optimistic approach that avoids the existence check API call.
   */
  tryDeleteRelationshipTuple: (
    params: RelationshipTupleDeleteParams
  ) => Promise<void>;
  /**
   * Try to assign a role to a user, silently ignoring if the assignment already exists (409 Conflict).
   * This is an optimistic approach that avoids the existence check API call.
   */
  tryAssignRole: (params: RoleAssignmentCreateParams) => Promise<void>;
  /**
   * Try to unassign a role from a user, silently ignoring if the assignment doesn't exist (404 Not Found).
   * This is an optimistic approach that avoids the existence check API call.
   */
  tryUnassignRole: (params: RoleAssignmentRemoveParams) => Promise<void>;
  /**
   * Try to create a user, silently ignoring if the user already exists (409 Conflict).
   * This is an optimistic approach that avoids the existence check API call.
   */
  tryCreateUser: (params: { key: string }) => Promise<void>;
  /**
   * Try to delete a user, silently ignoring if the user doesn't exist (404 Not Found).
   * This is an optimistic approach that avoids the existence check API call.
   */
  tryDeleteUser: (params: { key: string }) => Promise<void>;
  userExists: (key: string) => Promise<boolean>;
  deleteGroup: (groupKey: string) => Promise<void>;
  listGroups: () => Promise<void>;
  addUserToGroup: (
    groupKey: string,
    userId: string,
    orgKey: string
  ) => Promise<void>;
  removeUserFromGroup: (
    groupKey: string,
    userId: string,
    orgKey: string
  ) => Promise<void>;
  bulkCreateUsers: (
    users: {
      key: string;
      role_assignments: { role: string; tenant: string }[];
      attributes: unknown;
    }[]
  ) => Promise<void>;
  bulkCreateTenants: (
    tenants: {
      key: string;
      name: string;
      description: string;
      attributes: unknown;
    }[]
  ) => Promise<void>;
  bulkReplaceResourceInstances: (
    resourceInstances: {
      key: string;
      tenant: string;
      resource: string;
      attributes: unknown;
    }[]
  ) => Promise<void>;
  bulkDeleteResourceInstances: (keys: string[]) => Promise<void>;
  getAllDataOptimized: () => Promise<GetAllDataResult>;
}

export interface RelationshipTupleExistsParams {
  tenant: string;
  subject: string;
  relation: string;
  object: string;
}

export interface ResourceInstanceCreateParams {
  key: string;
  resource: string;
  tenant: string;
  attributes?: Record<string, unknown>;
}

export interface ResourceInstanceDeleteParams {
  instanceKey: string;
}

export interface ResourceInstanceResult {
  resource_id: string;
  key: string;
  tenant: string;
  resource: string;
  id: string;
  created_at: string;
  updated_at: string;
  attributes?: Record<string, unknown>;
}

export interface RelationshipTupleCreateParams {
  subject: string;
  relation: string;
  object: string;
  tenant: string;
}

export interface RelationshipTupleDeleteParams {
  subject: string;
  relation: string;
  object: string;
}

export interface RoleAssignmentRemoveParams {
  resource_instance: string;
  role: string;
  tenant: string;
  user: string;
}

export interface RoleAssignmentCreateParams {
  resource_instance: string;
  role: string;
  tenant: string;
  user: string;
}

export interface ListRelationshipTuplesParams {
  tenant: string;
  object?: string;
  subject?: string;
  relation?: string;
}

export const relationshipTupleSchema = z
  .object({
    id: z.string(),
    subject: z.string(),
    relation: z.string(),
    object: z.string(),
    subject_id: z.string(),
    relation_id: z.string(),
    object_id: z.string(),
    tenant_id: z.string(),
    organization_id: z.string(),
    project_id: z.string(),
    environment_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough(); // Allow additional keys that might be added in the future

export type RelationshipTuple = Readonly<
  z.infer<typeof relationshipTupleSchema>
>;

export interface ListRoleAssignmentsParams {
  tenant: string;
  resource_instance?: string;
  user?: string;
  role?: string;
}

export const roleAssignmentSchema = z
  .object({
    id: z.string(),
    user: z.string(),
    role: z.string(),
    tenant: z.string(),
    resource_instance: z.string().optional(),
    resource_id: z.string().optional(),
    resource: z.string().optional(),
    organization_id: z.string(),
    project_id: z.string(),
    environment_id: z.string(),
    created_at: z.string(),
  })
  .passthrough(); // Allow additional keys that might be added in the future

export type RoleAssignment = Readonly<z.infer<typeof roleAssignmentSchema>>;
