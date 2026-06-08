import type { EntityRegisterFields } from './types';

export const buildHierarchy = (
  entities: readonly EntityRegisterFields[]
): Array<EntityRegisterFields & { children: Array<EntityRegisterFields> }> => {
  const entityMap: {
    [key: string]: EntityRegisterFields & {
      children: Array<EntityRegisterFields>;
    };
  } = {};

  entities.forEach((entity) => {
    entityMap[entity.Id] = { ...entity, children: [] };
  });

  const result: Array<
    EntityRegisterFields & { children: Array<EntityRegisterFields> }
  > = [];

  entities.forEach((entity) => {
    if (!entity.ParentId) {
      result.push(entityMap[entity.Id]);
    } else {
      entityMap[entity.ParentId]?.children.push(entityMap[entity.Id]);
    }
  });

  return result;
};
