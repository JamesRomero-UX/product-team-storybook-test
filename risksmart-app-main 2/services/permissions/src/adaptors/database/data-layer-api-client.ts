import axios, { AxiosError } from 'axios';

import { getLogger } from '../../logger';
import { signRequest } from '../../utils/sign-request';
import { CachedSsmParameter } from '../ssm-parameter-client';

const logger = getLogger();

// Lazy-initialized SSM parameter client — defers SSM call until first use
let dataLayerUrlParam: CachedSsmParameter | null = null;

const isLocal = process.env.IS_LOCAL === 'true';

/**
 * Gets headers for API requests.
 * In production, signs requests with AWS SigV4 for IAM authentication.
 * In local development, skips signing as local services don't enforce IAM auth.
 */
async function getRequestHeaders(
  url: string,
  method: string,
  baseHeaders: Record<string, string>,
  body = ''
): Promise<Record<string, string>> {
  if (isLocal) {
    // Local services don't require IAM authentication, skip signing
    logger.debug('Skipping request signing for local development');

    return baseHeaders;
  }

  // Production: sign with AWS SigV4
  return signRequest(url, method, baseHeaders, body);
}

/**
 * Gets the data layer API URL from SSM Parameter Store.
 * In local dev, the SSM mock (scripts/local-mocks/ssm-mock.js) serves
 * the URL via AWS_ENDPOINT_URL_SSM.
 */
async function getDataLayerApiUrl(): Promise<string> {
  if (!dataLayerUrlParam) {
    const paramName = process.env.DATA_LAYER_INTERNAL_API_URL_SSM_PARAM;
    if (!paramName) {
      throw new Error(
        'DATA_LAYER_INTERNAL_API_URL_SSM_PARAM environment variable is not set.'
      );
    }
    dataLayerUrlParam = new CachedSsmParameter(paramName);
  }

  return await dataLayerUrlParam.getValue();
}

/**
 * Sync data types - matching the data layer API response types
 */
export interface SyncNodeRow {
  Id: string;
  OrgKey: string;
  ObjectType: string;
}

export interface SyncUserGroupRow {
  Id: string;
  OrgKey: string;
  Name: string;
  Description: string | null;
}

export interface SyncUserGroupUserRow {
  OrgKey: string;
  UserGroupId: string;
  UserId: string;
}

export interface SyncLinkedItemRow {
  Id: string;
  OrgKey: string;
  RelationshipType: string | null;
  source_node: {
    Id: string;
    OrgKey: string;
    ObjectType: string;
  } | null;
  target_node: {
    Id: string;
    OrgKey: string;
    ObjectType: string;
  } | null;
}

export interface SyncOwnerRow {
  OrgKey: string;
  UserId: string;
  ParentId: string;
  CreatedAtTimestamp: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  ModifiedAtTimestamp: string;
  parentNode: {
    OrgKey: string;
    Id: string;
    ObjectType: string;
    SequentialId: number | null;
  } | null;
}

export interface SyncContributorRow {
  OrgKey: string;
  UserId: string;
  ParentId: string;
  CreatedAtTimestamp: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  ModifiedAtTimestamp: string;
  parentNode: {
    OrgKey: string;
    Id: string;
    ObjectType: string;
    SequentialId: number | null;
  } | null;
}

export interface SyncOwnerGroupRow {
  OrgKey: string;
  UserGroupId: string;
  parentNode: {
    Id: string;
    OrgKey: string;
    ObjectType: string;
  } | null;
}

export interface SyncContributorGroupRow {
  OrgKey: string;
  UserGroupId: string;
  parentNode: {
    Id: string;
    OrgKey: string;
    ObjectType: string;
  } | null;
}

export interface SyncUserRoleRow {
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
}

export interface SyncOrganisationRow {
  OrgKey: string;
  Name: string;
}

export interface SyncUserRow {
  Id: string;
  userRoles: unknown[];
}

/**
 * Linked item as returned from the enriched node query
 */
export interface EnrichedLinkedItem {
  Id: string;
  Source: string;
  Target: string;
  RelationshipType: string | null;
}

/**
 * Owner as returned from the enriched node query
 */
export interface EnrichedOwner {
  ParentId: string;
  UserId: string;
  OrgKey: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  ModifiedAtTimestamp: string;
  CreatedAtTimestamp: string;
}

/**
 * Contributor as returned from the enriched node query
 */
export interface EnrichedContributor {
  ParentId: string;
  UserId: string;
  OrgKey: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  ModifiedAtTimestamp: string;
  CreatedAtTimestamp: string;
}

/**
 * Owner group as returned from the enriched node query
 */
export interface EnrichedOwnerGroup {
  ParentId: string;
  UserGroupId: string;
  OrgKey: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  ModifiedAtTimestamp: string;
  CreatedAtTimestamp: string;
}

/**
 * Contributor group as returned from the enriched node query
 */
export interface EnrichedContributorGroup {
  ParentId: string;
  UserGroupId: string;
  OrgKey: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  ModifiedAtTimestamp: string;
  CreatedAtTimestamp: string;
}

/**
 * Basic node result from the Data Layer API
 */
export interface NodeResult {
  Id: string;
  ObjectType: string;
  OrgKey: string;
}

/**
 * Enriched node result with all relationships from the Data Layer API
 */
export interface EnrichedNodeResult {
  Id: string;
  ObjectType: string;
  OrgKey: string;
  SequentialId: number | null;
  owners: EnrichedOwner[];
  contributors: EnrichedContributor[];
  ownerGroups: EnrichedOwnerGroup[];
  contributorGroups: EnrichedContributorGroup[];
  sourceLinkedItems: EnrichedLinkedItem[];
  targetLinkedItems: EnrichedLinkedItem[];
}

/**
 * Paginated response from the data layer API
 */
interface PaginatedApiResponse<T> {
  data: T[];
  pageMetadata: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: number | null;
    previousCursor: number | null;
  };
}

/**
 * Default page size for paginated requests
 */
const DEFAULT_PAGE_SIZE = 10000;

/**
 * Maximum number of pages to fetch to prevent infinite loops
 */
const MAX_PAGES = 500;

/**
 * Data Layer API client for permissions service
 * Provides access to sync data endpoints for permissions synchronization
 * Uses SSM Parameter Store for service URL discovery
 */
export class DataLayerApiClient {
  private apiUrl: string | null = null;

  private async getApiUrl(): Promise<string> {
    if (this.apiUrl) {
      return this.apiUrl;
    }
    const url = await getDataLayerApiUrl();
    this.apiUrl = url.replace(/\/$/, ''); // Remove trailing slash

    return this.apiUrl;
  }

  private getBaseHeaders(
    tenant: string,
    orgKey: string,
    userId: string
  ): Record<string, string> {
    return {
      'x-tenant': tenant,
      'x-org-key': orgKey,
      'x-user-id': userId,
      'Content-Type': 'application/json',
    };
  }

  private async get<T>(input: {
    path: string;
    tenant: string;
    orgKey: string;
    userId: string;
    context: string;
  }): Promise<T> {
    const { path, tenant, orgKey, userId, context } = input;
    const baseUrl = await this.getApiUrl();
    const url = `${baseUrl}${path}`;
    const baseHeaders = this.getBaseHeaders(tenant, orgKey, userId);

    logger.debug(`Fetching ${context} from Data Layer API`, {
      path,
      tenant,
      orgKey,
    });

    try {
      const headers = await getRequestHeaders(url, 'GET', baseHeaders);
      const response = await axios.get<{ data: T }>(url, {
        headers,
        validateStatus: (status) => status < 500,
      });

      if (response.status >= 400) {
        logger.error(`Failed to fetch ${context} from Data Layer API`, {
          path,
          status: response.status,
          error: response.data,
        });
        throw new Error(
          `Failed to fetch ${context}: ${response.status} ${JSON.stringify(response.data)}`
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error(`Failed to fetch ${context} from Data Layer API`, {
          path,
          status: error.response?.status,
          error: error.message,
        });
        throw new Error(
          `Failed to fetch ${context}: ${error.response?.status} ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Fetch all items from a paginated endpoint, iterating through all pages
   */
  private async getPaginated<T>(input: {
    path: string;
    tenant: string;
    orgKey: string;
    userId: string;
    context: string;
    pageSize?: number;
  }): Promise<T[]> {
    const {
      path,
      tenant,
      orgKey,
      userId,
      context,
      pageSize = DEFAULT_PAGE_SIZE,
    } = input;
    const baseUrl = await this.getApiUrl();
    const baseHeaders = this.getBaseHeaders(tenant, orgKey, userId);

    const allItems: T[] = [];
    let offset = 0;
    let hasNextPage = true;
    let pageCount = 0;

    logger.debug(`Fetching paginated ${context} from Data Layer API`, {
      path,
      tenant,
      orgKey,
      pageSize,
    });

    while (hasNextPage && pageCount < MAX_PAGES) {
      pageCount++;
      const separator = path.includes('?') ? '&' : '?';
      const url = `${baseUrl}${path}${separator}limit=${pageSize}&offset=${offset}`;

      try {
        const headers = await getRequestHeaders(url, 'GET', baseHeaders);
        const response = await axios.get<PaginatedApiResponse<T>>(url, {
          headers,
          validateStatus: (status) => status < 500,
        });

        if (response.status >= 400) {
          logger.error(`Failed to fetch ${context} from Data Layer API`, {
            path,
            status: response.status,
            error: response.data,
            offset,
          });
          throw new Error(
            `Failed to fetch ${context}: ${response.status} ${JSON.stringify(response.data)}`
          );
        }

        const { data, pageMetadata } = response.data;
        allItems.push(...data);
        hasNextPage = pageMetadata.hasNextPage;
        offset = pageMetadata.nextCursor ?? offset + pageSize;

        logger.debug(`Fetched page of ${context}`, {
          path,
          itemsInPage: data.length,
          totalSoFar: allItems.length,
          hasNextPage,
          nextOffset: offset,
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          logger.error(`Failed to fetch ${context} from Data Layer API`, {
            path,
            status: error.response?.status,
            error: error.message,
            offset,
          });
          throw new Error(
            `Failed to fetch ${context}: ${error.response?.status} ${error.message}`
          );
        }
        throw error;
      }
    }

    if (pageCount >= MAX_PAGES && hasNextPage) {
      logger.error(`Pagination limit reached for ${context}`, {
        path,
        totalItems: allItems.length,
        pageCount,
        maxPages: MAX_PAGES,
      });
      throw new Error(
        `Pagination limit reached for ${context}: fetched ${allItems.length} items across ${pageCount} pages, but more data exists. Increase MAX_PAGES or page size.`
      );
    }

    logger.debug(`Completed fetching all ${context}`, {
      path,
      totalItems: allItems.length,
      pageCount,
    });

    return allItems;
  }

  /**
   * Get a single node by ID
   */
  async getNode(
    tenant: string,
    orgKey: string,
    userId: string,
    objectId: string
  ): Promise<NodeResult | null> {
    return this.get<NodeResult>({
      path: `/nodes/${objectId}`,
      tenant,
      orgKey,
      userId,
      context: 'node',
    });
  }

  /**
   * Get enriched nodes with all relationships.
   * Pass `nodeIds` to fetch specific nodes, or omit to return all nodes.
   */
  async getEnrichedNodes(
    tenant: string,
    orgKey: string,
    userId: string,
    nodeIds?: string[]
  ): Promise<EnrichedNodeResult[]> {
    const queryParams = nodeIds?.length ? `?nodeIds=${nodeIds.join(',')}` : '';

    return this.get<EnrichedNodeResult[]>({
      path: `/nodes/enriched${queryParams}`,
      tenant,
      orgKey,
      userId,
      context: 'enriched nodes',
    });
  }

  /**
   * Get nodes for an organization.
   * Pass `nodeIds` to fetch specific nodes, or omit to return all nodes.
   */
  async getNodes(
    tenant: string,
    orgKey: string,
    userId: string,
    nodeIds?: string[]
  ): Promise<SyncNodeRow[]> {
    const queryParams = nodeIds?.length ? `?nodeIds=${nodeIds.join(',')}` : '';

    return this.getPaginated<SyncNodeRow>({
      path: `/nodes${queryParams}`,
      tenant,
      orgKey,
      userId,
      context: 'nodes',
    });
  }

  /**
   * Get all user groups for an organization
   */
  async getUserGroups(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncUserGroupRow[]> {
    return this.getPaginated<SyncUserGroupRow>({
      path: '/user-groups',
      tenant,
      orgKey,
      userId,
      context: 'user groups',
    });
  }

  /**
   * Get all user group users for an organization
   */
  async getUserGroupUsers(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncUserGroupUserRow[]> {
    return this.getPaginated<SyncUserGroupUserRow>({
      path: '/user-group-users',
      tenant,
      orgKey,
      userId,
      context: 'user group users',
    });
  }

  /**
   * Get all parent-child linked items for an organization
   */
  async getLinkedItems(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncLinkedItemRow[]> {
    return this.getPaginated<SyncLinkedItemRow>({
      path: '/linked-items',
      tenant,
      orgKey,
      userId,
      context: 'linked items',
    });
  }

  /**
   * Get all owners for an organization
   */
  async getOwners(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncOwnerRow[]> {
    return this.getPaginated<SyncOwnerRow>({
      path: '/owners',
      tenant,
      orgKey,
      userId,
      context: 'owners',
    });
  }

  /**
   * Get all contributors for an organization
   */
  async getContributors(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncContributorRow[]> {
    return this.getPaginated<SyncContributorRow>({
      path: '/contributors',
      tenant,
      orgKey,
      userId,
      context: 'contributors',
    });
  }

  /**
   * Get all owner groups for an organization
   */
  async getOwnerGroups(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncOwnerGroupRow[]> {
    return this.getPaginated<SyncOwnerGroupRow>({
      path: '/owner-groups',
      tenant,
      orgKey,
      userId,
      context: 'owner groups',
    });
  }

  /**
   * Get all contributor groups for an organization
   */
  async getContributorGroups(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncContributorGroupRow[]> {
    return this.getPaginated<SyncContributorGroupRow>({
      path: '/contributor-groups',
      tenant,
      orgKey,
      userId,
      context: 'contributor groups',
    });
  }

  /**
   * Get all user roles for an organization
   */
  async getUserRoles(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncUserRoleRow[]> {
    return this.getPaginated<SyncUserRoleRow>({
      path: '/user-roles',
      tenant,
      orgKey,
      userId,
      context: 'user roles',
    });
  }

  /**
   * Get organisations by orgKeys
   */
  async getOrganisations(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncOrganisationRow[]> {
    return this.getPaginated<SyncOrganisationRow>({
      path: '/organisations',
      tenant,
      orgKey,
      userId,
      context: 'organisations',
    });
  }

  /**
   * Get all users for the tenant
   */
  async getUsers(
    tenant: string,
    orgKey: string,
    userId: string
  ): Promise<SyncUserRow[]> {
    return this.getPaginated<SyncUserRow>({
      path: '/users',
      tenant,
      orgKey,
      userId,
      context: 'users',
    });
  }
}

// Export a singleton instance of the client
export const dataLayerApiClient = new DataLayerApiClient();
