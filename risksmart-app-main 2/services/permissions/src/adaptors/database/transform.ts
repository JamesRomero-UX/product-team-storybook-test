/**
 * Mappers for transforming enriched node data (PascalCase DB fields)
 * to domain models (camelCase) used by processors.
 *
 * This layer ensures:
 * - Clean separation between DB/API response shapes and internal domain models
 * - Processors receive only the data they need (no extra properties)
 * - Single place for field name transformations
 */

// ============================================================================
// Enriched Node Types (from Data Layer API / DB)
// ============================================================================

/**
 * User item as returned from the Data Layer API
 */
export interface EnrichedUserItem {
  UserId: string;
}

/**
 * User group item as returned from the Data Layer API
 */
export interface EnrichedUserGroupItem {
  UserGroupId: string;
}

// ============================================================================
// Domain Types (used by processors)
// ============================================================================

/**
 * User item for role assignment processors
 */
export interface UserItem {
  userId: string;
}

/**
 * User group item for group relationship processors
 */
export interface UserGroupItem {
  userGroupId: string;
}

// ============================================================================
// Mappers
// ============================================================================

/**
 * Maps an enriched user item to a domain user item.
 * Extracts only the userId, discarding other properties.
 */
export const mapEnrichedUserToUserItem = (
  enrichedUser: EnrichedUserItem
): UserItem => ({
  userId: enrichedUser.UserId,
});

/**
 * Maps an array of enriched user items to domain user items.
 */
export const mapEnrichedUsersToUserItems = (
  enrichedUsers: EnrichedUserItem[]
): UserItem[] => enrichedUsers.map(mapEnrichedUserToUserItem);

/**
 * Maps an enriched user group item to a domain user group item.
 * Extracts only the userGroupId, discarding other properties.
 */
export const mapEnrichedUserGroupToUserGroupItem = (
  enrichedUserGroup: EnrichedUserGroupItem
): UserGroupItem => ({
  userGroupId: enrichedUserGroup.UserGroupId,
});

/**
 * Maps an array of enriched user group items to domain user group items.
 */
export const mapEnrichedUserGroupsToUserGroupItems = (
  enrichedUserGroups: EnrichedUserGroupItem[]
): UserGroupItem[] =>
  enrichedUserGroups.map(mapEnrichedUserGroupToUserGroupItem);
