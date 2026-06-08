import {
  asChapter,
  asRule,
  asTask,
  type NewObligation,
  newObligationStandardSchema,
  type ObligationId,
} from '@risksmart-app/domain/src/types/obligation';
import type {
  RegulatorySource,
  RegulatorySourceId,
} from '@risksmart-app/domain/src/types/regulatory-source';

import { getLogger } from '../../../../utils/logger';
import type {
  NewIngestedObligation,
  ObligationLookup,
  ParentIdMap,
} from './types';

const logger = getLogger();

interface Dependencies {
  saveExternalObligations: (
    obligations: NewObligation[]
  ) => Promise<{ id: ObligationId; externalId: string }[]>;
  getObligationIdsByExternalIds: (
    externalIds: string[],
    orgKey: string,
    regulatorySourceId: RegulatorySourceId
  ) => Promise<Map<string, ObligationLookup>>;
}

export const createSyncExternalObligations = ({
  saveExternalObligations,
  getObligationIdsByExternalIds,
}: Dependencies) => {
  /**
   * Hydrates an ingested obligation into a full NewObligation by adding
   * required fields such as orgKey, createdByUser, modifiedByUser, adherence, and externalSyncedAt.
   */
  const hydrateObligations = (
    ingested: NewIngestedObligation,
    orgKey: string,
    externalSyncedAt: Date,
    regulatorySourceId: RegulatorySourceId,
    existingId?: ObligationId
  ): NewObligation =>
    ({
      ...ingested,
      ...(existingId && { id: existingId }),
      orgKey,
      createdByUser: 'SYSTEM',
      modifiedByUser: 'SYSTEM',
      adherence: 'advised', // Default for external obligations. This is going to become optional in future
      externalSyncedAt,
      regulatorySourceId,
      parentId: null, // parentId is determined later in the process based on externalParentId and the mapping to existing obligations
    }) satisfies NewObligation;

  /** Separates obligations by their type into standards, chapters, rules and tasks. */
  const separateByType = (
    obligations: NewObligation[]
  ): {
    standards: NewObligation[];
    chapters: NewObligation[];
    rules: NewObligation[];
    tasks: NewObligation[];
  } => {
    const standards: NewObligation[] = [];
    const chapters: NewObligation[] = [];
    const rules: NewObligation[] = [];
    const tasks: NewObligation[] = [];

    obligations.forEach((obligation) => {
      switch (obligation.type) {
        case 'standard':
          standards.push(obligation);
          break;
        case 'chapter':
          chapters.push(obligation);
          break;
        case 'rule':
          rules.push(obligation);
          break;
        case 'task':
          tasks.push(obligation);
          break;
        default:
          logger.warn('Unknown obligation type', { obligation });
      }
    });

    return { standards, chapters, rules, tasks };
  };

  const buildObligationIdMap = async ({
    externalIds,
    orgKey,
    regulatorySourceId,
  }: {
    externalIds: string[];
    orgKey: string;
    regulatorySourceId: RegulatorySourceId;
  }): Promise<ParentIdMap> => {
    const set = new Set<string>(externalIds);

    return await getObligationIdsByExternalIds(
      Array.from(set),
      orgKey,
      regulatorySourceId
    );
  };

  const processUpdates = async ({
    regulatorySource,
    updates,
    orgKey,
    externalSyncedAt,
  }: {
    regulatorySource: RegulatorySource;
    updates: NewIngestedObligation[];
    orgKey: string;
    externalSyncedAt: Date;
  }): Promise<{ id: ObligationId; externalId: string }[]> => {
    if (updates.length === 0) {
      return [];
    }

    const existingIdsMap = await buildObligationIdMap({
      externalIds: updates.map((u) => u.externalId),
      orgKey,
      regulatorySourceId: regulatorySource.id,
    });

    const linkedUpdates = updates.map((ingested) => {
      const existing = existingIdsMap.get(ingested.externalId);

      if (!existing) {
        throw new Error(
          `Cannot update obligation that does not exist: ${ingested.externalId}`
        );
      }

      const hydrated = hydrateObligations(
        ingested,
        orgKey,
        externalSyncedAt,
        regulatorySource.id,
        existing.obligationId
      );

      return { ...hydrated, parentId: existing.parentId };
    });

    return await saveExternalObligations(linkedUpdates);
  };

  const resolveParent = (
    obligation: NewObligation,
    parentIdMap: ParentIdMap,
    typeName: string
  ): ObligationLookup => {
    const parent = obligation.externalParentId
      ? parentIdMap.get(obligation.externalParentId)
      : null;

    if (!parent) {
      logger.error(`Parent not found for ${typeName}`, { obligation });
      throw new Error(`Parent not found for ${typeName}`);
    }

    return parent;
  };

  const processLevel = async <T extends NewObligation>(
    items: NewObligation[],
    link: (item: NewObligation) => T,
    parentIdMap: ParentIdMap
  ): Promise<{ id: ObligationId; externalId: string }[]> => {
    if (items.length === 0) {
      return [];
    }

    const linked = items.map(link);
    const saved = await saveExternalObligations(linked);

    for (const item of saved) {
      if (item.externalId) {
        const linkedItem = linked.find((l) => l.externalId === item.externalId);
        parentIdMap.set(item.externalId, {
          obligationId: item.id,
          parentId: linkedItem?.parentId ?? null,
        });
      }
    }

    return saved;
  };

  const processAdditions = async ({
    regulatorySource,
    additions,
    orgKey,
    externalSyncedAt,
  }: {
    regulatorySource: RegulatorySource;
    additions: NewIngestedObligation[];
    orgKey: string;
    externalSyncedAt: Date;
  }): Promise<{ id: ObligationId; externalId: string }[]> => {
    if (additions.length === 0) {
      return [];
    }

    const parentIdMap = await buildObligationIdMap({
      externalIds: additions
        .filter((a) => a.externalParentId)
        // this assertion is safe due to the filter above
        .map((a) => a.externalParentId as string),
      orgKey,
      regulatorySourceId: regulatorySource.id,
    });

    const hydratedObligations = additions.map((ingested) =>
      hydrateObligations(
        ingested,
        orgKey,
        externalSyncedAt,
        regulatorySource.id
      )
    );

    const { standards, chapters, rules, tasks } =
      separateByType(hydratedObligations);

    // Process each level in order: standards → chapters → rules → tasks
    // Each level's saved IDs are added to parentIdMap for the next level to resolve
    const savedStandards = await processLevel(
      standards,
      (s) => newObligationStandardSchema.parse(s),
      parentIdMap
    );

    const savedChapters = await processLevel(
      chapters,
      (c) =>
        asChapter(c, resolveParent(c, parentIdMap, 'chapter').obligationId),
      parentIdMap
    );

    const savedRules = await processLevel(
      rules,
      (r) => asRule(r, resolveParent(r, parentIdMap, 'rule').obligationId),
      parentIdMap
    );

    const savedTasks = await processLevel(
      tasks,
      (t) => asTask(t, resolveParent(t, parentIdMap, 'task').obligationId),
      parentIdMap
    );

    return [...savedStandards, ...savedChapters, ...savedRules, ...savedTasks];
  };

  return { processUpdates, processAdditions };
};
