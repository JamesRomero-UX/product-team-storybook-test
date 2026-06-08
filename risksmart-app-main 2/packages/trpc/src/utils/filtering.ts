import { filter } from '@risksmart-app/permitio/src/permit';

import type { ServiceContext } from '../services/service.types';

interface LinkedItem {
  Id: string;
  Source: string;
  Target: string;
}

export const filterLinkedItems = async <T extends LinkedItem[]>(
  data: T,
  ctx: ServiceContext
) => {
  const idsToCheck = data.flatMap((entity) => {
    return [
      { LinkedItemId: entity.Id, NodeId: entity.Source },
      { LinkedItemId: entity.Id, NodeId: entity.Target },
    ];
  });

  const filteredIds = await filter<{ LinkedItemId: string; NodeId: string }>(
    idsToCheck,
    'rs_node',
    (entity: { LinkedItemId: string; NodeId: string }) => entity.NodeId,
    ctx.userId,
    ctx.orgId
  );

  const filteredLinkedItemsMap = new Map(
    filteredIds.map((item) => [`${item.LinkedItemId}-${item.NodeId}`, item])
  );

  const filteredLinkedItemsResults = data.filter((entity) => {
    return (
      filteredLinkedItemsMap.has(`${entity.Id}-${entity.Source}`) &&
      filteredLinkedItemsMap.has(`${entity.Id}-${entity.Target}`)
    );
  }) as T;

  return filteredLinkedItemsResults;
};
