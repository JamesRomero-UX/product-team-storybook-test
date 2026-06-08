import { RS_NODE_ID } from '@risksmart-app/permitio/src/types';

export interface RelationshipTuple {
  subject: string;
  object: string;
}

export type GroupResourceType = 'owner_group' | 'contributor_group';
export type NodeResourceType = 'rs_node';
export type ResourceType = GroupResourceType | NodeResourceType;

/**
 * Gets a prefix string for a resource type (e.g., 'rs_node:')
 */
const getResourcePrefix = (resourceType: ResourceType): string =>
  `${resourceType}:`;

/**
 * Checks if a composite ID starts with the specified resource type prefix.
 */
const hasResourceType = (
  compositeId: string,
  resourceType: ResourceType
): boolean => compositeId.startsWith(getResourcePrefix(resourceType));

/**
 * Extracts the ID portion from a composite ID by removing the resource type prefix.
 */
const extractId = (compositeId: string, resourceType: ResourceType): string =>
  compositeId.replace(getResourcePrefix(resourceType), '');

/**
 * Extracts resource instance IDs from relationship tuples based on the subject field.
 * Filters for 'rs_node' type resources and extracts the ID portion.
 *
 * @param relationships - Array of relationship tuples from Permit.io API
 * @returns Array of resource instance IDs (without the 'rs_node:' prefix)
 *
 * @example
 * // Given relationships where this resource is the object (looking for parents)
 * const parents = extractParentIds(parentRelationships);
 * // Returns: ['parent-id-1', 'parent-id-2']
 */
export const extractParentIds = (
  relationships: RelationshipTuple[]
): string[] =>
  relationships
    .filter((r) => hasResourceType(r.subject, 'rs_node'))
    .map((r) => extractId(r.subject, 'rs_node'));

/**
 * Extracts resource instance IDs from relationship tuples based on the object field.
 * Filters for 'rs_node' type resources and extracts the ID portion.
 *
 * @param relationships - Array of relationship tuples from Permit.io API
 * @returns Array of resource instance IDs (without the 'rs_node:' prefix)
 *
 * @example
 * // Given relationships where this resource is the subject (looking for children)
 * const children = extractChildIds(childRelationships);
 * // Returns: ['child-id-1', 'child-id-2']
 */
export const extractChildIds = (relationships: RelationshipTuple[]): string[] =>
  relationships
    .filter((r) => hasResourceType(r.object, 'rs_node'))
    .map((r) => extractId(r.object, 'rs_node'));

/**
 * Extracts group IDs from relationship tuples based on a resource type prefix.
 * Filters for the specified resource type and extracts the ID portion from the subject field.
 *
 * @param relationships - Array of relationship tuples from Permit.io API
 * @param resourceType - The resource type prefix to filter by (e.g., 'owner_group', 'contributor_group')
 * @returns Array of group IDs (without the resource type prefix)
 *
 * @example
 * // Given relationships with owner_group subjects
 * const ownerGroups = extractGroupIds(relationships, 'owner_group');
 * // Returns: ['group-id-1', 'group-id-2']
 */
export const extractGroupIds = (
  relationships: Pick<RelationshipTuple, 'subject'>[],
  resourceType: GroupResourceType
): string[] =>
  relationships
    .filter((r) => hasResourceType(r.subject, resourceType))
    .map((r) => extractId(r.subject, resourceType));

export const findIdsToRemove = (
  currentIds: string[],
  desiredIds: string[]
): string[] => currentIds.filter((id) => !desiredIds.includes(id));

/**
 * Default relation type used for parent-child relationships in Permit.io
 */
export const RS_PARENT_RELATION = 'rs_parent';

/**
 * Input for creating a relationship tuple
 */
export interface RelationshipTupleCreateInput {
  subject: string;
  relation: string;
  object: string;
  tenant: string;
}

/**
 * Input for deleting a relationship tuple
 */
export interface RelationshipTupleDeleteInput {
  subject: string;
  relation: string;
  object: string;
}

/**
 * Maps to relationship tuple inputs for parent relationships.
 * Each parent becomes the subject, with the resource as the object.
 *
 * @param parents - Array of parent objects with parentType and parentId
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @param orgKey - The organization/tenant key
 * @returns Array of relationship tuple inputs ready for creation
 *
 * @example
 * const inputs = mapToParentRelationshipTupleCreateInputs(
 *   [{ parentType: 'rs_node', parentId: 'parent-uuid' }],
 *   'rs_node:child-uuid',
 *   'org_key'
 * );
 * // Returns: [{ subject: 'rs_node:parent-uuid', relation: 'rs_parent', object: 'rs_node:child-uuid', tenant: 'org_key' }]
 */
export const mapToParentRelationshipTupleCreateInputs = (
  parents: { parentType: string; parentId: string }[],
  resourceInstanceKey: string,
  orgKey: string
): RelationshipTupleCreateInput[] =>
  parents.map((parent) => ({
    subject: `${parent.parentType}:${parent.parentId}`,
    relation: RS_PARENT_RELATION,
    object: resourceInstanceKey,
    tenant: orgKey,
  }));

/**
 * Maps to relationship tuple inputs for child relationships.
 * The resource becomes the subject (parent), with each child as the object.
 *
 * @param children - Array of child objects with childType and childId
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @param orgKey - The organization/tenant key
 * @returns Array of relationship tuple inputs ready for creation
 *
 * @example
 * const inputs = mapToChildRelationshipTupleCreateInputs(
 *   [{ childType: 'rs_node', childId: 'child-uuid' }],
 *   'rs_node:parent-uuid',
 *   'org_key'
 * );
 * // Returns: [{ subject: 'rs_node:parent-uuid', relation: 'rs_parent', object: 'rs_node:child-uuid', tenant: 'org_key' }]
 */
export const mapToChildRelationshipTupleCreateInputs = (
  children: { childType: string; childId: string }[],
  resourceInstanceKey: string,
  orgKey: string
): RelationshipTupleCreateInput[] =>
  children.map((child) => ({
    subject: resourceInstanceKey,
    relation: RS_PARENT_RELATION,
    object: `${child.childType}:${child.childId}`,
    tenant: orgKey,
  }));

/**
 * Maps to relationship tuple delete inputs for parent relationships.
 * Each ID becomes the subject (parent), with the resource as the object.
 *
 * @param parentIds - Array of parent resource IDs to create delete inputs for
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @returns Array of relationship tuple delete inputs
 *
 * @example
 * const inputs = mapToParentRelationshipTupleDeleteInputs(
 *   ['parent-uuid-1', 'parent-uuid-2'],
 *   'rs_node:object-uuid'
 * );
 * // Returns: [{ subject: 'rs_node:parent-uuid-1', relation: 'rs_parent', object: 'rs_node:object-uuid' }, ...]
 */
export const mapToParentRelationshipTupleDeleteInputs = (
  parentIds: string[],
  resourceInstanceKey: string
): RelationshipTupleDeleteInput[] =>
  parentIds.map((id) => ({
    subject: RS_NODE_ID(id),
    relation: RS_PARENT_RELATION,
    object: resourceInstanceKey,
  }));

/**
 * Maps to relationship tuple delete inputs for child relationships.
 * The resource becomes the subject (parent), with each ID as the object (child).
 *
 * @param childIds - Array of child resource IDs to create delete inputs for
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @returns Array of relationship tuple delete inputs
 *
 * @example
 * const inputs = mapToChildRelationshipTupleDeleteInputs(
 *   ['child-uuid-1', 'child-uuid-2'],
 *   'rs_node:object-uuid'
 * );
 * // Returns: [{ subject: 'rs_node:object-uuid', relation: 'rs_parent', object: 'rs_node:child-uuid-1' }, ...]
 */
export const mapToChildRelationshipTupleDeleteInputs = (
  childIds: string[],
  resourceInstanceKey: string
): RelationshipTupleDeleteInput[] =>
  childIds.map((id) => ({
    subject: resourceInstanceKey,
    relation: RS_PARENT_RELATION,
    object: RS_NODE_ID(id),
  }));

/**
 * Relation types for group-to-resource relationships
 */
export type GroupRelationType = 'owner' | 'contributor';

/**
 * Maps a group relation type to its corresponding resource type prefix
 */
export const getGroupResourceType = (
  relationType: GroupRelationType
): GroupResourceType =>
  relationType === 'owner' ? 'owner_group' : 'contributor_group';

/**
 * Input for assigning a role to a user on a resource instance
 */
export interface RoleAssignmentInput {
  resource_instance: string;
  role: string;
  tenant: string;
  user: string;
}

/**
 * Input for unassigning a role from a user on a resource instance
 */
export interface RoleUnassignmentInput {
  resource_instance: string;
  role: string;
  tenant: string;
  user: string;
}

/**
 * Maps to relationship tuple inputs for group-to-resource relationships.
 * Each group becomes the subject, with the resource as the object.
 *
 * @param groupIds - Array of group IDs to create relationship tuples for
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @param relationType - The type of relationship ('owner' or 'contributor')
 * @param orgKey - The organization/tenant key
 * @returns Array of relationship tuple inputs ready for creation
 *
 * @example
 * const inputs = mapToGroupRelationshipTupleCreateInputs(
 *   ['group-1', 'group-2'],
 *   'rs_node:object-uuid',
 *   'owner',
 *   'org_key'
 * );
 * // Returns: [
 * //   { subject: 'owner_group:group-1', relation: 'owner', object: 'rs_node:object-uuid', tenant: 'org_key' },
 * //   { subject: 'owner_group:group-2', relation: 'owner', object: 'rs_node:object-uuid', tenant: 'org_key' }
 * // ]
 */
export const mapToGroupRelationshipTupleCreateInputs = (
  groupIds: string[],
  resourceInstanceKey: string,
  relationType: GroupRelationType,
  orgKey: string
): RelationshipTupleCreateInput[] => {
  const resourceType = getGroupResourceType(relationType);

  return groupIds.map((groupId) => ({
    subject: `${resourceType}:${groupId}`,
    relation: relationType,
    object: resourceInstanceKey,
    tenant: orgKey,
  }));
};

/**
 * Maps to relationship tuple delete inputs for group-to-resource relationships.
 * Each group becomes the subject, with the resource as the object.
 *
 * @param groupIds - Array of group IDs to create delete inputs for
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @param relationType - The type of relationship ('owner' or 'contributor')
 * @returns Array of relationship tuple delete inputs
 *
 * @example
 * const inputs = mapToGroupRelationshipTupleDeleteInputs(
 *   ['group-1', 'group-2'],
 *   'rs_node:object-uuid',
 *   'owner'
 * );
 * // Returns: [
 * //   { subject: 'owner_group:group-1', relation: 'owner', object: 'rs_node:object-uuid' },
 * //   { subject: 'owner_group:group-2', relation: 'owner', object: 'rs_node:object-uuid' }
 * // ]
 */
export const mapToGroupRelationshipTupleDeleteInputs = (
  groupIds: string[],
  resourceInstanceKey: string,
  relationType: GroupRelationType
): RelationshipTupleDeleteInput[] => {
  const resourceType = getGroupResourceType(relationType);

  return groupIds.map((groupId) => ({
    subject: `${resourceType}:${groupId}`,
    relation: relationType,
    object: resourceInstanceKey,
  }));
};

/**
 * Role types for user role assignments
 */
export type RoleType = 'Owner' | 'Contributor';

/**
 * Maps to role assignment inputs for assigning users to a role on an resource.
 *
 * @param userIds - Array of user IDs to assign the role to
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @param role - The role to assign ('Owner' or 'Contributor')
 * @param orgKey - The organization/tenant key
 * @returns Array of role assignment inputs ready for use
 *
 * @example
 * const inputs = mapToRoleAssignmentInputs(
 *   ['user-1', 'user-2'],
 *   'rs_node:object-uuid',
 *   'Owner',
 *   'org_key'
 * );
 * // Returns: [
 * //   { resource_instance: 'rs_node:object-uuid', role: 'Owner', tenant: 'org_key', user: 'user-1' },
 * //   { resource_instance: 'rs_node:object-uuid', role: 'Owner', tenant: 'org_key', user: 'user-2' }
 * // ]
 */
export const mapToRoleAssignmentInputs = (
  userIds: string[],
  resourceInstanceKey: string,
  role: RoleType,
  orgKey: string
): RoleAssignmentInput[] =>
  userIds.map((userId) => ({
    resource_instance: resourceInstanceKey,
    role,
    tenant: orgKey,
    user: userId,
  }));

/**
 * Maps to role unassignment inputs for removing users from a role on an resource.
 *
 * @param userIds - Array of user IDs to unassign the role from
 * @param resourceInstanceKey - The instance key of the resource (e.g., 'rs_node:uuid')
 * @param role - The role to unassign ('Owner' or 'Contributor')
 * @param orgKey - The organization/tenant key
 * @returns Array of role unassignment inputs ready for use
 *
 * @example
 * const inputs = createRoleUnassignmentInputs(
 *   ['user-1', 'user-2'],
 *   'rs_node:object-uuid',
 *   'Owner',
 *   'org_key'
 * );
 * // Returns: [
 * //   { resource_instance: 'rs_node:object-uuid', role: 'Owner', tenant: 'org_key', user: 'user-1' },
 * //   { resource_instance: 'rs_node:object-uuid', role: 'Owner', tenant: 'org_key', user: 'user-2' }
 * // ]
 */
export const mapToRoleUnassignmentInputs = (
  userIds: string[],
  resourceInstanceKey: string,
  role: RoleType,
  orgKey: string
): RoleUnassignmentInput[] =>
  userIds.map((userId) => ({
    resource_instance: resourceInstanceKey,
    role,
    tenant: orgKey,
    user: userId,
  }));
