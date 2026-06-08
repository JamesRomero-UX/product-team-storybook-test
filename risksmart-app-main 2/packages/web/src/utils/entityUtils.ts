/**
 * Entity-related utility functions for building entity paths and hierarchies
 */

export interface EntityWithParent {
  Id: string;
  Name: string;
  ParentId: null | string;
  parent?: EntityWithParent | null;
}

/**
 * Base interface for GraphQL entity types that can be transformed
 */
interface GraphQLEntity {
  Id: string;
  Name: string;
  ParentId?: null | string | undefined;
  parent?: GraphQLEntity | null | undefined;
}

/**
 * Transforms entity data from GraphQL response to EntityWithParent format
 * This function handles the recursive transformation of nested entity structures
 * @param entity - GraphQL entity object with optional parent relationship
 * @returns Transformed entity in EntityWithParent format, or null if input is null
 */
export const transformEntityData = (
  entity: GraphQLEntity | null | undefined
): EntityWithParent | null => {
  if (!entity) {
    return null;
  }

  return {
    Id: entity.Id,
    Name: entity.Name,
    ParentId: entity.ParentId ?? null,
    parent: entity.parent ? transformEntityData(entity.parent) : null,
  };
};

/**
 * Builds a hierarchical path string for an entity showing the full parent chain
 * @deprecated Use buildEntityPathFromArray with flat entity data instead for unlimited depth
 * @param entity - Entity with optional parent relationship
 * @param separator - String to separate entity names in the path (default: ' > ')
 * @returns Hierarchical path string (e.g., "Corporate > IT Department > Security")
 */
export const getEntityPath = (
  entity: EntityWithParent | null | undefined,
  separator: string = ' > '
): string => {
  if (!entity) {
    return '';
  }

  const path: string[] = [];
  let current: EntityWithParent | null | undefined = entity;

  // Build path from current entity up to root
  while (current) {
    path.unshift(current.Name);
    current = current.parent;
  }

  return path.join(separator);
};

/**
 * Gets the display label for an entity, optionally including the full path
 * @param entity - Entity with optional parent relationship
 * @param showFullPath - Whether to show the full hierarchical path
 * @returns Entity display label
 */
export const getEntityDisplayLabel = (
  entity: EntityWithParent | null | undefined,
  showFullPath: boolean = true
): string => {
  if (!entity) {
    return '';
  }

  if (showFullPath && entity.parent) {
    return getEntityPath(entity);
  }

  return entity.Name;
};

/**
 * Builds entity path from an array of entities by walking the parent chain
 * Used when entity data doesn't include nested parent objects
 * @param entityId - ID of the target entity
 * @param entities - Array of all available entities
 * @param separator - String to separate entity names in the path
 * @returns Hierarchical path string
 */
export const buildEntityPathFromArray = (
  entityId: null | string | undefined,
  entities: Array<{ Id: string; Name: string; ParentId: null | string }>,
  separator: string = ' > '
): string => {
  if (!entityId || !entities.length) {
    return '';
  }

  const entityMap = new Map(entities.map((e) => [e.Id, e]));
  const path: string[] = [];
  let currentId: null | string = entityId;

  // Prevent infinite loops with a depth limit
  let depth = 0;
  const maxDepth = 50;

  while (currentId && depth < maxDepth) {
    const entity = entityMap.get(currentId);
    if (!entity) {
      break;
    }

    path.unshift(entity.Name);
    currentId = entity.ParentId;
    depth++;
  }

  return path.join(separator);
};

/**
 * Checks if an entity has a parent hierarchy
 * @param entity - Entity to check
 * @returns True if entity has parent(s)
 */
export const hasEntityHierarchy = (
  entity: EntityWithParent | null | undefined
): boolean => {
  return !!(entity?.parent || entity?.ParentId);
};

/**
 * Gets the root entity for a given entity by walking up the parent chain
 * @param entity - Entity with parent relationship
 * @returns The root entity (one without a parent)
 */
export const getRootEntity = (
  entity: EntityWithParent | null | undefined
): EntityWithParent | null => {
  if (!entity) {
    return null;
  }

  let current = entity;
  while (current.parent) {
    current = current.parent;
  }

  return current;
};

/**
 * Formats entity information for display in selection components
 * @param entity - Entity with optional parent relationship
 * @param options - Formatting options
 * @returns Formatted entity string for UI display
 */
export const formatEntityForDisplay = (
  entity: EntityWithParent | null | undefined,
  options: {
    showFullPath?: boolean;
    prefix?: string;
    maxLength?: number;
  } = {}
): string => {
  const { showFullPath = true, prefix = 'Entity: ', maxLength } = options;

  if (!entity) {
    return '';
  }

  const entityLabel = getEntityDisplayLabel(entity, showFullPath);
  let result = prefix + entityLabel;

  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + '...';
  }

  return result;
};
