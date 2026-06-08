import type { EntityNode } from '@risksmart-app/components/src/global-header/global-actions/global-entity-picker/EntityNode';

/**
 * Entity shape returned by the GetEntities GraphQL query.
 * Each entity has its direct children as { Id, Name } references.
 */
export type FlatEntity = {
  Id: string;
  Name: string;
  children?: Array<{ Id: string; Name: string }>;
};

/**
 * Converts a flat list of entities (each carrying their direct children by
 * reference) into a full `EntityNode[]` tree.
 *
 * Root entities are detected by finding every entity whose Id does not appear
 * in any other entity's `children` list.
 *
 * This replaces the old `.filter((e) => !e.children?.length)` that stripped
 * parent entities from the picker — see RSP-5685.
 */
export const buildEntityTree = (entities: FlatEntity[]): EntityNode[] => {
  if (!entities.length) return [];

  const entityMap = new Map(entities.map((e) => [e.Id, e]));

  const buildNode = (id: string): EntityNode | null => {
    const entity = entityMap.get(id);
    if (!entity) return null;
    const children = entity.children?.length
      ? entity.children
          .map((c) => buildNode(c.Id))
          .filter((n): n is EntityNode => n !== null)
      : undefined;
    return {
      id: entity.Id,
      name: entity.Name,
      ...(children?.length ? { children } : {}),
    };
  };

  // Root entities: those not referenced as a child of any other entity
  const childIds = new Set(
    entities.flatMap((e) => e.children?.map((c) => c.Id) ?? []),
  );
  const rootEntities = entities.filter((e) => !childIds.has(e.Id));

  return rootEntities
    .map((e) => buildNode(e.Id))
    .filter((n): n is EntityNode => n !== null);
};
