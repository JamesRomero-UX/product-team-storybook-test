import type { RegulatorId } from 'src/domain/types';
import type { NewRawExternalObligationChange } from 'src/domain/types/obligation-change';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface Dependencies {
  getObligationChanges: (
    pageNumber: number
  ) => Promise<NewRawExternalObligationChange[] | null>;
}

/**
 * Ascent does not offer an endpoint to fetch all obligation changes for a regulator, so we have to page through them here and return them for grouping by regulator in the use case.
 */
export const createFetchAllObligationChangesByRegulator = ({
  getObligationChanges,
}: Dependencies) => {
  const groupByRegulator = (
    taskRegulatorIdMap: Map<string, RegulatorId>,
    items: NewRawExternalObligationChange[]
  ): Map<RegulatorId, NewRawExternalObligationChange[]> => {
    const map = new Map<RegulatorId, NewRawExternalObligationChange[]>();
    const unmappedObligations: {
      externalId: string;
      externalParentId: string;
    }[] = [];

    for (const item of items) {
      const regulatorId = taskRegulatorIdMap.get(item.externalParentId);
      if (!regulatorId) {
        // this could be because the parent task was filtered out of the regulator grouping by `isInEffect`
        // log and skip these unmapped obligation changes rather than throwing an error and halting the entire ingestion
        unmappedObligations.push({
          externalId: item.externalId,
          externalParentId: item.externalParentId,
        });

        continue;
      }

      const existing = map.get(regulatorId);
      if (existing) {
        existing.push(item);
      } else {
        map.set(regulatorId, [item]);
      }
    }

    if (unmappedObligations.length > 0) {
      logger.info(`Unable to map obligation changes to regulator`, {
        unmappedObligations,
      });
    }

    return map;
  };

  return async (
    taskRegulatorIdMap: Map<string, RegulatorId>
  ): Promise<Map<RegulatorId, NewRawExternalObligationChange[]>> => {
    const allItems: Map<RegulatorId, NewRawExternalObligationChange[]> =
      new Map();

    for (let pageNumber = 1; ; pageNumber++) {
      const items = await getObligationChanges(pageNumber);

      if (items === null) {
        break;
      }

      const itemsByRegulator = groupByRegulator(taskRegulatorIdMap, items);

      for (const [regulatorId, regulatorItems] of itemsByRegulator.entries()) {
        const existing = allItems.get(regulatorId);
        if (existing) {
          existing.push(...regulatorItems);
          allItems.set(regulatorId, existing);
        } else {
          allItems.set(regulatorId, regulatorItems);
        }
      }
    }

    return allItems;
  };
};
