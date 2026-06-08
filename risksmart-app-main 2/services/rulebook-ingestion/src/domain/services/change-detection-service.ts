import { getLogger } from 'src/logger';

import type {
  IngestionRun,
  IngestionRunId,
  Obligation,
  RegulatorId,
} from '../types';
import type { ObligationChange } from '../types/obligation-change';

const logger = getLogger();

export interface Changeset<T extends Obligation | ObligationChange> {
  added: T[];
  updated: T[];
  removed: T[];
}

export interface Dependencies<T extends Obligation | ObligationChange> {
  getHashesForRegulator: (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ) => Promise<{ externalId: string; contentHash: string }[]>;

  getByRegulator: (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId,
    externalIds: string[]
  ) => Promise<T[]>;
}

/**
 * Creates a per-regulator change detection service.
 * This detects changes for a specific regulator, comparing the current run with a provided baseline.
 * Detects added, updated, and removed items (e.g., obligations or obligation changes).
 */
export const createChangeDetectionService =
  <T extends Obligation | ObligationChange>({
    getHashesForRegulator,
    getByRegulator,
  }: Dependencies<T>) =>
  async (
    ingestionRun: IngestionRun,
    baselineRun: IngestionRun | null,
    regulatorId: RegulatorId
  ): Promise<Changeset<T>> => {
    const result: Changeset<T> = {
      added: [],
      updated: [],
      removed: [],
    };

    const currentHashes = await getHashesForRegulator(
      ingestionRun.id,
      regulatorId
    );

    logger.info('Fetched item hashes for regulator in current run', {
      ingestionRunId: ingestionRun.id,
      regulatorId,
      hashCount: currentHashes.length,
    });

    if (baselineRun === null) {
      logger.info(
        'No baseline run provided to compare against, treating all items as new',
        {
          ingestionRunId: ingestionRun.id,
          regulatorId,
          provider: ingestionRun.providerName,
        }
      );

      result.added = await getByRegulator(
        ingestionRun.id,
        regulatorId,
        currentHashes.map((h) => h.externalId)
      );

      return result;
    }

    const baselineHashes = await getHashesForRegulator(
      baselineRun.id,
      regulatorId
    );

    logger.info('Fetched item hashes for regulator in baseline run', {
      ingestionRunId: ingestionRun.id,
      baselineRunId: baselineRun.id,
      regulatorId,
      hashCount: baselineHashes.length,
    });

    const addedIds: string[] = [];
    const updatedIds: string[] = [];
    const removedIds: string[] = [];

    const baselineHashMap = new Map<string, string>();
    for (const { externalId, contentHash } of baselineHashes) {
      baselineHashMap.set(externalId, contentHash);
    }

    const currentHashMap = new Map<string, string>();
    for (const { externalId, contentHash } of currentHashes) {
      currentHashMap.set(externalId, contentHash);
    }

    // Detect added and updated items
    for (const current of currentHashes) {
      const baselineHash = baselineHashMap.get(current.externalId);

      if (!baselineHash) {
        addedIds.push(current.externalId);
      } else if (baselineHash !== current.contentHash) {
        updatedIds.push(current.externalId);
      }
    }

    // Detect removed items (present in baseline but missing in current)
    for (const baseline of baselineHashes) {
      if (!currentHashMap.has(baseline.externalId)) {
        removedIds.push(baseline.externalId);
      }
    }

    logger.info('Compared item hashes for regulator', {
      ingestionRunId: ingestionRun.id,
      baselineRunId: baselineRun.id,
      regulatorId,
      addedCount: addedIds.length,
      updatedCount: updatedIds.length,
      removedCount: removedIds.length,
      unchangedCount:
        currentHashes.length - addedIds.length - updatedIds.length,
    });

    if (addedIds.length > 0) {
      result.added = await getByRegulator(
        ingestionRun.id,
        regulatorId,
        addedIds
      );
    }

    if (updatedIds.length > 0) {
      result.updated = await getByRegulator(
        ingestionRun.id,
        regulatorId,
        updatedIds
      );
    }

    if (removedIds.length > 0) {
      result.removed = await getByRegulator(
        baselineRun.id,
        regulatorId,
        removedIds
      );
    }

    logger.info('Change detection completed for regulator', {
      ingestionRunId: ingestionRun.id,
      regulatorId,
      addedCount: result.added.length,
      updatedCount: result.updated.length,
      removedCount: result.removed.length,
    });

    return result;
  };
