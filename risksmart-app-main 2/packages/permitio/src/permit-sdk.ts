import { Permit } from 'permitio';
import { z } from 'zod';

import { PermitValidationError } from './errors';
import type {
  GetAllDataResult,
  ListRelationshipTuplesParams,
  ListRoleAssignmentsParams,
  RelationshipTuple,
  RelationshipTupleExistsParams,
  RoleAssignment,
} from './types';
import { relationshipTupleSchema, roleAssignmentSchema } from './types';
import { getEnv } from './utils/environment';
import { logger } from './utils/logger';
import { resilientFetch, withRetryWrapper } from './utils/resilient-fetch';

const apiUrl = getEnv('PERMIT_API_URL');
const endpoint = getEnv('PDP_ENDPOINT');
const factsEndpoint =
  getEnv('PROXY_FACTS_VIA_PDP', true) === 'true'
    ? getEnv('PDP_ENDPOINT')
    : apiUrl;

const fetchOptions = (
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  token: string
) => ({
  method: method,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

// Module-level cache for key scope, keyed by token
const keyScopeCache = new Map<
  string,
  { organization_id: string; project_id: string; environment_id: string }
>();

/** Clears the key scope cache. Exported for testing purposes only. */
export const clearKeyScopeCache = () => {
  keyScopeCache.clear();
};

/**
 * Creates a Permit SDK client for managing authorization data.
 * @param token - Permit.io API key
 */
export const permitSDK = (token: string) => {
  const permit = new Permit({
    pdp: endpoint,
    token,
    apiUrl,
  });
  const cachedScope = keyScopeCache.get(token);
  let organization_id: string | undefined = cachedScope?.organization_id;
  let project_id: string | undefined = cachedScope?.project_id;
  let environment_id: string | undefined = cachedScope?.environment_id;

  const getKeyScope = async () => {
    const data = await resilientFetch(
      `${apiUrl}/v2/api-key/scope`,
      fetchOptions('GET', token),
      'getKeyScope'
    );

    return data.json() as Promise<{
      organization_id: string;
      project_id: string;
      environment_id: string;
    }>;
  };

  const init = async () => {
    if (!organization_id || !project_id || !environment_id) {
      logger.info({}, 'Getting key scope');
      const keyScope = await getKeyScope();
      organization_id = keyScope.organization_id;
      project_id = keyScope.project_id;
      environment_id = keyScope.environment_id;
      // Cache the key scope for future invocations with the same token
      keyScopeCache.set(token, keyScope);
    }
    logger.info({}, 'Retrieved key scope');
  };

  const resourceInstanceExists = async (
    key: string,
    resource: string,
    orgKey: string
  ) => {
    const params = new URLSearchParams({
      search: key,
      tenant: orgKey,
    });

    const res = await resilientFetch(
      `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/resource_instances?${params}`,
      fetchOptions('GET', token),
      'resourceInstanceExists'
    );
    const data = (await res.json()) as Array<{ resource: string }>;
    if (data.length === 0) {
      logger.info(
        { key, resource, orgKey },
        'Resource instance does not exist'
      );

      return false;
    }
    // Check if the resource instance is of the expected type
    logger.info(
      { key, resource, orgKey, resourceInstances: data },
      'Checking if resource instance is of the expected type'
    );
    if (
      data.filter((item: { resource: string }) => item.resource === resource)
        .length === 0
    ) {
      logger.info(
        { key, resource, orgKey },
        'Resource instance exists but not of the expected type'
      );

      return false;
    }
    logger.info(
      { key, resource, orgKey },
      'Resource instance exists and is of the expected type'
    );

    return true;
  };

  const relationshipTupleExists = async (
    params: RelationshipTupleExistsParams
  ) => {
    const { subject, relation, object, tenant } = params;

    const queryParams = new URLSearchParams({
      subject,
      relation,
      object,
      tenant,
    });

    const res = await resilientFetch(
      `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/relationship_tuples?${queryParams}`,
      fetchOptions('GET', token),
      'relationshipTupleExists'
    );

    const validatedResult = z
      .array(relationshipTupleSchema)
      .safeParse(await res.json());

    if (!validatedResult.success) {
      throw new PermitValidationError(
        `Invalid relationship tuple response structure: ${validatedResult.error.message}`
      );
    }

    const data: RelationshipTuple[] = validatedResult.data;

    if (data.length === 0) {
      logger.info(
        { subject, relation, object, tenant },
        'Relationship tuple does not exist'
      );

      return false;
    }

    const exactMatch = data.find(
      (tuple) =>
        tuple.subject === subject &&
        tuple.relation === relation &&
        tuple.object === object &&
        tuple.tenant_id === tenant
    );

    if (!exactMatch) {
      logger.info(
        {
          subject,
          relation,
          object,
          tenant,
        },
        'Relationship tuple data exists but no exact match found'
      );

      return false;
    }

    logger.info(
      { subject, relation, object, tenant, matchedTupleId: exactMatch.id },
      'Relationship tuple exists'
    );

    return true;
  };

  return {
    /** Initializes the SDK by fetching and caching the API key scope. Called automatically by other methods. */
    init,
    /**
     * Creates a user group with associated owner and contributor groups and parent relationships.
     * @param groupKey - Unique group instance key identifier (e.g., 'a1b2c3d4-uuid')
     * @param orgKey - Tenant/organization key (e.g., 'org_abc123')
     */
    createGroup: async (groupKey: string, orgKey: string) => {
      await init();
      logger.info(
        {
          groupKey,
          orgKey,
        },
        'Creating user group'
      );

      const userGroupExists = await resourceInstanceExists(
        groupKey,
        'user_group',
        orgKey
      );

      if (userGroupExists) {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'User group already exists. Skipping creation'
        );
      } else {
        await resilientFetch(
          `${apiUrl}/v2/schema/${project_id}/${environment_id}/groups`,
          {
            ...fetchOptions('POST', token),
            body: JSON.stringify({
              group_resource_type_key: 'user_group',
              group_instance_key: groupKey,
              group_tenant: orgKey,
            }),
          },
          'createGroup'
        );

        logger.info({}, 'User group created successfully');
      }

      const ownerGroupExists = await resourceInstanceExists(
        groupKey,
        'owner_group',
        orgKey
      );

      if (ownerGroupExists) {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Owner group already exists. Skipping owner group creation'
        );
      } else {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Creating owner group resource'
        );
        await withRetryWrapper(
          () =>
            permit.api.resourceInstances.create({
              key: groupKey,
              resource: 'owner_group',
              tenant: orgKey,
            }),
          'permitSDK.resourceInstances.create.owner_group'
        );
      }

      const contributorGroupExists = await resourceInstanceExists(
        groupKey,
        'contributor_group',
        orgKey
      );
      if (contributorGroupExists) {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Contributor group already exists. Skipping creation'
        );
      } else {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Creating contributor group resource'
        );
        await withRetryWrapper(
          () =>
            permit.api.resourceInstances.create({
              key: groupKey,
              resource: 'contributor_group',
              tenant: orgKey,
            }),
          'permitSDK.resourceInstances.create.contributor_group'
        );
      }

      const userOwnerRelationships = await withRetryWrapper(
        () =>
          permit.api.relationshipTuples.list({
            subject: `user_group:${groupKey}`,
            relation: 'parent',
            object: `owner_group:${groupKey}`,
            tenant: orgKey,
          }),
        'permitSDK.relationshipTuples.list.userOwner'
      );

      if (userOwnerRelationships.length === 0) {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Creating parent structure between user group and owner group'
        );
        await withRetryWrapper(
          () =>
            permit.api.relationshipTuples.create({
              subject: `user_group:${groupKey}`,
              relation: 'parent',
              object: `owner_group:${groupKey}`,
              tenant: orgKey,
            }),
          'permitSDK.relationshipTuples.create.userOwner'
        );
      } else {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Parent structure between user group and owner group already exists'
        );
      }

      const userContributorRelationships = await withRetryWrapper(
        () =>
          permit.api.relationshipTuples.list({
            subject: `user_group:${groupKey}`,
            relation: 'parent',
            object: `contributor_group:${groupKey}`,
            tenant: orgKey,
          }),
        'permitSDK.relationshipTuples.list.userContributor'
      );
      if (userContributorRelationships.length === 0) {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Creating parent structure between user group and contributor group'
        );
        await withRetryWrapper(
          () =>
            permit.api.relationshipTuples.create({
              subject: `user_group:${groupKey}`,
              relation: 'parent',
              object: `contributor_group:${groupKey}`,
              tenant: orgKey,
            }),
          'permitSDK.relationshipTuples.create.userContributor'
        );
      } else {
        logger.info(
          {
            groupKey,
            orgKey,
          },
          'Parent structure between user group and contributor group already exists'
        );
      }
      logger.info({}, 'Created group resources');
    },
    /**
     * Deletes a user group and its associated owner_group and contributor_group resources.
     * @param groupKey - Unique group instance key identifier (e.g., 'a1b2c3d4-uuid')
     */
    deleteGroup: async (groupKey: string) => {
      await init();
      logger.info({}, 'Deleting user group');
      await resilientFetch(
        `${apiUrl}/v2/schema/${project_id}/${environment_id}/groups/user_group:${groupKey}`,
        fetchOptions('DELETE', token),
        'deleteGroup'
      );
      logger.info({}, 'Deleting owner group');
      await withRetryWrapper(
        () => permit.api.resourceInstances.delete(`owner_group:${groupKey}`),
        'permitSDK.resourceInstances.delete.owner_group'
      );
      logger.info({}, 'Deleting contributor group');
      await withRetryWrapper(
        () =>
          permit.api.resourceInstances.delete(`contributor_group:${groupKey}`),
        'permitSDK.resourceInstances.delete.contributor_group'
      );
      logger.info({}, 'Deleting user group instance');
      try {
        await withRetryWrapper(
          () => permit.api.resourceInstances.delete(`user_group:${groupKey}`),
          'permitSDK.resourceInstances.delete.user_group'
        );
      } catch (e) {
        logger.info(
          { e },
          'error deleting user group instance, this may be because the above group delete processed it'
        );
      }
    },
    /** Lists all user groups in the current environment. */
    listGroups: async () => {
      await init();
    },
    /**
     * Adds a user to a user group within a tenant.
     * @param groupKey - Unique group instance key identifier (e.g., 'a1b2c3d4-uuid')
     * @param userId - User key to add (e.g., 'auth0|abc123')
     * @param orgKey - Tenant/organization key (e.g., 'org_abc123')
     */
    addUserToGroup: async (
      groupKey: string,
      userId: string,
      orgKey: string
    ) => {
      await init();
      await resilientFetch(
        `${apiUrl}/v2/schema/${project_id}/${environment_id}/groups/user_group:${groupKey}/users/${userId}`,
        {
          ...fetchOptions('PUT', token),
          body: JSON.stringify({
            tenant: orgKey,
          }),
        },
        'addUserToGroup'
      );
    },
    /**
     * Removes a user from a user group within a tenant.
     * @param groupKey - Unique group instance key identifier (e.g., 'a1b2c3d4-uuid')
     * @param userId - User key to remove (e.g., 'auth0|abc123')
     * @param orgKey - Tenant/organization key (e.g., 'org_abc123')
     */
    removeUserFromGroup: async (
      groupKey: string,
      userId: string,
      orgKey: string
    ) => {
      await init();
      await resilientFetch(
        `${apiUrl}/v2/schema/${project_id}/${environment_id}/groups/user_group:${groupKey}/users/${userId}`,
        {
          ...fetchOptions('DELETE', token),
          body: JSON.stringify({
            tenant: orgKey,
          }),
        },
        'removeUserFromGroup'
      );
    },
    /**
     * Attempts to create a user group. Silently succeeds if already exists (409).
     * @param userGroupKey - Unique user group instance key identifier (e.g., 'a1b2c3d4-uuid')
     * @param orgKey - Tenant/organization key (e.g., 'org_abc123')
     */
    tryCreateUserGroup: async (userGroupKey: string, orgKey: string) => {
      await init();

      try {
        await resilientFetch(
          `${apiUrl}/v2/schema/${project_id}/${environment_id}/groups`,
          {
            ...fetchOptions('POST', token),
            body: JSON.stringify({
              group_resource_type_key: 'user_group',
              group_instance_key: userGroupKey,
              group_tenant: orgKey,
            }),
          },
          'tryCreateUserGroup'
        );

        logger.info(
          { userGroupKey, orgKey },
          'User group created successfully'
        );
      } catch (error) {
        // Handle 409 Conflict - user group already exists
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 409
        ) {
          logger.info(
            { userGroupKey, orgKey },
            'User group already exists (409 Conflict)'
          );

          return;
        }

        throw error;
      }
    },
    /**
     * Creates or replaces multiple resource instances in a single bulk operation.
     * @param resourceInstances - Array of resource instances to upsert
     * @param resourceInstances[].key - Unique group instance key identifier (e.g., 'a1b2c3d4-uuid')
     * @param resourceInstances[].tenant - Tenant key (e.g., 'org_abc123')
     * @param resourceInstances[].resource - Resource type (e.g., 'risk', 'control', 'rs_node')
     * @param resourceInstances[].attributes - Custom attributes (e.g., { ObjectType: 'risk' })
     */
    bulkReplaceResourceInstances: async (
      resourceInstances: {
        key: string;
        tenant: string;
        resource: string;
        attributes: unknown;
      }[]
    ) => {
      await init();
      await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/bulk/resource_instances`,
        {
          ...fetchOptions('PUT', token),
          body: JSON.stringify({
            operations: resourceInstances,
          }),
        },
        'bulkReplaceResourceInstances'
      );
    },
    /**
     * Deletes multiple resource instances in a single bulk operation.
     * @param keys - Array of resource instance identifiers (e.g., ['risk:risk-abc123', 'rs_node:uuid-here'])
     */
    bulkDeleteResourceInstances: async (keys: string[]) => {
      await init();
      await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/bulk/resource_instances`,
        {
          ...fetchOptions('DELETE', token),
          body: JSON.stringify({
            idents: keys,
          }),
        },
        'bulkDeleteResourceInstances'
      );
    },
    /**
     * Creates multiple tenants in a single bulk operation.
     * @param tenants - Array of tenant objects to create
     * @param tenants[].key - Unique tenant identifier (e.g., 'org_abc123')
     * @param tenants[].name - Display name (e.g., 'Acme Corp')
     * @param tenants[].description - Tenant description
     * @param tenants[].attributes - Custom tenant attributes
     */
    bulkCreateTenants: async (
      tenants: {
        key: string;
        name: string;
        description: string;
        attributes: unknown;
      }[]
    ) => {
      await init();
      await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/bulk/tenants`,
        {
          ...fetchOptions('POST', token),
          body: JSON.stringify({
            operations: tenants,
          }),
        },
        'bulkCreateTenants'
      );
    },
    /**
     * Creates multiple users with optional role assignments in a single bulk operation.
     * @param users - Array of user objects to create
     * @param users[].key - Unique user identifier (e.g., 'auth0|abc123')
     * @param users[].role_assignments - Initial role assignments (e.g., [{ role: 'admin', tenant: 'org_abc123' }])
     * @param users[].attributes - Custom user attributes (e.g., { email: 'user@example.com' })
     */
    bulkCreateUsers: async (
      users: {
        key: string;
        role_assignments: { role: string; tenant: string }[];
        attributes: unknown;
      }[]
    ) => {
      await init();
      await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/bulk/users`,
        {
          ...fetchOptions('POST', token),
          body: JSON.stringify({
            operations: users,
          }),
        },
        'bulkCreateUsers'
      );
    },
    /**
     * Deletes multiple users in a single bulk operation.
     * @param ids - Array of user identifiers to delete (e.g., ['auth0|abc123', 'auth0|def456'])
     */
    bulkDeleteUsers: async (ids: string[]) => {
      await init();
      await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/bulk/users`,
        {
          ...fetchOptions('DELETE', token),
          body: JSON.stringify({
            idents: ids,
          }),
        },
        'bulkDeleteUsers'
      );
    },
    /**
     * Checks if a resource instance exists for a specific resource type within a tenant.
     * @param key - Resource instance key to check (e.g., 'a1b2c3d4-uuid')
     * @param resource - Resource type to match (e.g., 'risk', 'control', 'rs_node')
     * @param orgKey - Tenant/organization key (e.g., 'org_abc123')
     */
    resourceInstanceExists: async (
      key: string,
      resource: string,
      orgKey: string
    ) => {
      await init();

      return await resourceInstanceExists(key, resource, orgKey);
    },
    /**
     * Checks if a relationship tuple exists between two resource instances.
     * @param params.subject - Subject (e.g., 'user_group:dev-team', 'rs_node:parent-uuid')
     * @param params.relation - Relationship type (e.g., 'parent', 'owner', 'member')
     * @param params.object - Object (e.g., 'owner_group:dev-team', 'rs_node:child-uuid')
     * @param params.tenant - Tenant/organization key (e.g., 'org_abc123')
     */
    relationshipTupleExists: async (params: RelationshipTupleExistsParams) => {
      await init();

      return await relationshipTupleExists(params);
    },
    /**
     * Lists relationship tuples matching the specified filters.
     * @param params.tenant - Required. Tenant/organization key (e.g., 'org_abc123')
     * @param params.object - Optional. Filter by object (e.g., 'rs_node:child-uuid')
     * @param params.subject - Optional. Filter by subject (e.g., 'rs_node:parent-uuid')
     * @param params.relation - Optional. Filter by relationship type (e.g., 'rs_parent', 'owner')
     */
    listRelationshipTuples: async (
      params: ListRelationshipTuplesParams
    ): Promise<RelationshipTuple[]> => {
      await init();

      const { tenant, object, subject, relation } = params;
      const queryParams = new URLSearchParams({ tenant });

      if (object) {
        queryParams.set('object', object);
      }
      if (subject) {
        queryParams.set('subject', subject);
      }
      if (relation) {
        queryParams.set('relation', relation);
      }

      logger.info(
        { tenant, object, subject, relation },
        'Listing relationship tuples'
      );

      const res = await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/relationship_tuples?${queryParams}`,
        fetchOptions('GET', token),
        'listRelationshipTuples'
      );

      const validatedResult = z
        .array(relationshipTupleSchema)
        .safeParse(await res.json());

      if (!validatedResult.success) {
        throw new PermitValidationError(
          `Invalid relationship tuple response structure: ${validatedResult.error.message}`
        );
      }

      logger.info(
        { count: validatedResult.data.length },
        'Successfully listed relationship tuples'
      );

      return validatedResult.data;
    },
    /**
     * Lists role assignments matching the specified filters.
     * @param params.tenant - Required. Tenant/organization key (e.g., 'org_abc123')
     * @param params.resource_instance - Optional. Filter by resource (e.g., 'rs_node:uuid-here')
     * @param params.user - Optional. Filter by user key (e.g., 'auth0|abc123')
     * @param params.role - Optional. Filter by role key (e.g., 'Owner', 'Contributor')
     */
    listRoleAssignments: async (
      params: ListRoleAssignmentsParams
    ): Promise<RoleAssignment[]> => {
      await init();

      const { tenant, resource_instance, user, role } = params;
      const queryParams = new URLSearchParams({ tenant });

      if (resource_instance) {
        queryParams.set('resource_instance', resource_instance);
      }
      if (user) {
        queryParams.set('user', user);
      }
      if (role) {
        queryParams.set('role', role);
      }

      logger.info(
        { tenant, resource_instance, user, role },
        'Listing role assignments'
      );

      const res = await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/role_assignments?${queryParams}`,
        fetchOptions('GET', token),
        'listRoleAssignments'
      );

      const validatedResult = z
        .array(roleAssignmentSchema)
        .safeParse(await res.json());

      if (!validatedResult.success) {
        throw new PermitValidationError(
          `Invalid role assignment response structure: ${validatedResult.error.message}`
        );
      }

      logger.info(
        { count: validatedResult.data.length },
        'Successfully listed role assignments'
      );

      return validatedResult.data;
    },
    /**
     * Attempts to create a resource instance. Returns false if already exists (409).
     * @param params.key - Unique identifier for the resource instance (e.g., 'a1b2c3d4-uuid')
     * @param params.resource - Resource type key (e.g., 'rs_node')
     * @param params.tenant - Tenant/organization key (e.g., 'org_abc123')
     * @param params.attributes - Optional custom attributes (e.g., { ObjectType: 'risk', level: 'high' })
     */
    tryCreateResourceInstance: async (params: {
      key: string;
      resource: string;
      tenant: string;
      attributes?: Record<string, unknown>;
    }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/resource_instances`,
          {
            ...fetchOptions('POST', token),
            body: JSON.stringify({
              key: params.key,
              resource: params.resource,
              tenant: params.tenant,
              attributes: params.attributes ?? {},
            }),
          },
          'tryCreateResourceInstance'
        );

        logger.info(
          { key: params.key, resource: params.resource, tenant: params.tenant },
          'Resource instance created successfully'
        );

        return true;
      } catch (error) {
        // Handle 409 Conflict - resource already exists
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 409
        ) {
          logger.info(
            {
              key: params.key,
              resource: params.resource,
              tenant: params.tenant,
            },
            'Resource instance already exists (409 Conflict)'
          );

          return false;
        }

        throw error;
      }
    },
    /**
     * Attempts to delete a resource instance. Silently succeeds if not found (404).
     * @param params.instanceKey - Resource instance key identifier (e.g., 'a1b2c3d4-uuid')
     */
    tryDeleteResourceInstance: async (params: { instanceKey: string }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/resource_instances/${params.instanceKey}`,
          fetchOptions('DELETE', token),
          'tryDeleteResourceInstance'
        );

        logger.info(
          { instanceKey: params.instanceKey },
          'Resource instance deleted successfully'
        );
      } catch (error) {
        // Handle 404 Not Found - resource instance doesn't exist
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 404
        ) {
          logger.info(
            { instanceKey: params.instanceKey },
            'Resource instance does not exist (404 Not Found)'
          );

          return;
        }

        throw error;
      }
    },
    /**
     * Attempts to create a relationship tuple. Silently succeeds if already exists (409).
     * @param params.subject - Subject (e.g., 'rs_node:parent-uuid', 'user_group:dev-team')
     * @param params.relation - Relationship type (e.g., 'rs_parent', 'owner', 'member')
     * @param params.object - Object (e.g., 'rs_node:child-uuid', 'owner_group:dev-team')
     * @param params.tenant - Tenant/organization key (e.g., 'org_abc123')
     */
    tryCreateRelationshipTuple: async (params: {
      subject: string;
      relation: string;
      object: string;
      tenant: string;
    }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/relationship_tuples`,
          {
            ...fetchOptions('POST', token),
            body: JSON.stringify({
              subject: params.subject,
              relation: params.relation,
              object: params.object,
              tenant: params.tenant,
            }),
          },
          'tryCreateRelationshipTuple'
        );

        logger.info(
          {
            subject: params.subject,
            relation: params.relation,
            object: params.object,
            tenant: params.tenant,
          },
          'Relationship tuple created successfully'
        );
      } catch (error) {
        // Handle 409 Conflict - relationship already exists
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 409
        ) {
          logger.info(
            {
              subject: params.subject,
              relation: params.relation,
              object: params.object,
              tenant: params.tenant,
            },
            'Relationship tuple already exists (409 Conflict)'
          );

          return;
        }

        throw error;
      }
    },
    /**
     * Attempts to delete a relationship tuple. Silently succeeds if not found (404).
     * @param params.subject - Subject (e.g., 'rs_node:parent-uuid', 'user_group:dev-team')
     * @param params.relation - Relationship type (e.g., 'rs_parent', 'owner', 'member')
     * @param params.object - Object (e.g., 'rs_node:child-uuid', 'owner_group:dev-team')
     */
    tryDeleteRelationshipTuple: async (params: {
      subject: string;
      relation: string;
      object: string;
    }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/relationship_tuples`,
          {
            ...fetchOptions('DELETE', token),
            body: JSON.stringify({
              subject: params.subject,
              relation: params.relation,
              object: params.object,
            }),
          },
          'tryDeleteRelationshipTuple'
        );

        logger.info(
          {
            subject: params.subject,
            relation: params.relation,
            object: params.object,
          },
          'Relationship tuple deleted successfully'
        );
      } catch (error) {
        // Handle 404 Not Found - relationship doesn't exist
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 404
        ) {
          logger.info(
            {
              subject: params.subject,
              relation: params.relation,
              object: params.object,
            },
            'Relationship tuple does not exist (404 Not Found)'
          );

          return;
        }

        throw error;
      }
    },
    /**
     * Attempts to assign a role to a user. Silently succeeds if already exists (409).
     * @param params.resource_instance - Resource (e.g., 'rs_node:uuid-here', 'risk:risk-abc123')
     * @param params.role - Role key to assign (e.g., 'Owner', 'Contributor')
     * @param params.tenant - Tenant/organization key (e.g., 'org_abc123')
     * @param params.user - User key (e.g., 'auth0|abc123')
     */
    tryAssignRole: async (params: {
      resource_instance: string;
      role: string;
      tenant: string;
      user: string;
    }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/role_assignments`,
          {
            ...fetchOptions('POST', token),
            body: JSON.stringify({
              resource_instance: params.resource_instance,
              role: params.role,
              tenant: params.tenant,
              user: params.user,
            }),
          },
          'tryAssignRole'
        );

        logger.info(
          {
            resource_instance: params.resource_instance,
            role: params.role,
            tenant: params.tenant,
            user: params.user,
          },
          'Role assigned successfully'
        );
      } catch (error) {
        // Handle 409 Conflict - role assignment already exists
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 409
        ) {
          logger.info(
            {
              resource_instance: params.resource_instance,
              role: params.role,
              tenant: params.tenant,
              user: params.user,
            },
            'Role assignment already exists (409 Conflict)'
          );

          return;
        }

        throw error;
      }
    },
    /**
     * Attempts to unassign a role from a user. Silently succeeds if not found (404).
     * @param params.resource_instance - Resource (e.g., 'rs_node:uuid-here', 'risk:risk-abc123')
     * @param params.role - Role key to unassign (e.g., 'Owner', 'Contributor')
     * @param params.tenant - Tenant/organization key (e.g., 'org_abc123')
     * @param params.user - User key (e.g., 'auth0|abc123')
     */
    tryUnassignRole: async (params: {
      resource_instance: string;
      role: string;
      tenant: string;
      user: string;
    }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/role_assignments`,
          {
            ...fetchOptions('DELETE', token),
            body: JSON.stringify({
              resource_instance: params.resource_instance,
              role: params.role,
              tenant: params.tenant,
              user: params.user,
            }),
          },
          'tryUnassignRole'
        );

        logger.info(
          {
            resource_instance: params.resource_instance,
            role: params.role,
            tenant: params.tenant,
            user: params.user,
          },
          'Role assignment removed successfully'
        );
      } catch (error) {
        // Handle 404 Not Found - role assignment doesn't exist
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 404
        ) {
          logger.info(
            {
              resource_instance: params.resource_instance,
              role: params.role,
              tenant: params.tenant,
              user: params.user,
            },
            'Role assignment does not exist (404 Not Found)'
          );

          return;
        }

        throw error;
      }
    },
    /**
     * Attempts to create a user. Silently succeeds if already exists (409).
     * @param params.key - Unique user identifier (e.g., 'auth0|abc123')
     */
    tryCreateUser: async (params: { key: string }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/users`,
          {
            ...fetchOptions('POST', token),
            body: JSON.stringify({
              key: params.key,
            }),
          },
          'tryCreateUser'
        );

        logger.info({ key: params.key }, 'User created successfully');
      } catch (error) {
        // Handle 409 Conflict - user already exists
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 409
        ) {
          logger.info(
            { key: params.key },
            'User already exists (409 Conflict)'
          );

          return;
        }

        throw error;
      }
    },
    /**
     * Try to delete a user, silently ignoring if the user doesn't exist (404 Not Found).
     * @param params.key - Unique user identifier (e.g., 'auth0|abc123')
     */
    tryDeleteUser: async (params: { key: string }) => {
      await init();

      try {
        await resilientFetch(
          `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/users/${params.key}`,
          fetchOptions('DELETE', token),
          'tryDeleteUser'
        );

        logger.info({ key: params.key }, 'User deleted successfully');
      } catch (error) {
        // Handle 404 Not Found - user doesn't exist
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 404
        ) {
          logger.info(
            { key: params.key },
            'User does not exist (404 Not Found)'
          );

          return;
        }

        throw error;
      }
    },
    /** Retrieves all authorization data (users, tenants, roles, relationships, resource instances) in OPAL-optimized format. */
    getAllDataOptimized: async () => {
      await init();
      const res = await resilientFetch(
        `${apiUrl}/v2/internal/opal_data/${organization_id}/${project_id}/${environment_id}/optimized`,
        fetchOptions('GET', token),
        'getAllDataOptimized'
      );

      return res.json() as Promise<GetAllDataResult>;
    },
    /**
     * Checks if a user exists in Permit.io.
     * @param key - User identifier to search for (e.g., 'auth0|abc123')
     */
    userExists: async (key: string) => {
      await init();
      const params = new URLSearchParams({
        search: key,
      });

      const res = await resilientFetch(
        `${factsEndpoint}/v2/facts/${project_id}/${environment_id}/users?${params}`,
        fetchOptions('GET', token),
        'userExists'
      );
      const data = await res.json();
      logger.info({ data }, 'User existence check result');
      if (
        (data as { data?: unknown[] })?.data?.length &&
        (data as { data: unknown[] }).data.length > 0
      ) {
        logger.info({ key }, 'User exists');

        return true;
      }

      return false;
    },
  };
};
