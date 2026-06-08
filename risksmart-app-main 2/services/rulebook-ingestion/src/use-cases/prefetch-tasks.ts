import {
  completePrefetch,
  failIngestionRun,
  type IngestionRun,
  type IngestionRunId,
  type NewRawExternalObligation,
  type RegulatorId,
  startPrefetching,
} from 'src/domain/types';
import type { NewRawExternalObligationChange } from 'src/domain/types/obligation-change';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface Dependencies {
  getIngestionRun: (
    ingestionRunId: IngestionRunId
  ) => Promise<IngestionRun | null>;

  updateIngestionRun: (ingestionRun: IngestionRun) => Promise<IngestionRun>;

  fetchAllTasksByRegulator: () => Promise<
    Map<RegulatorId, NewRawExternalObligation[]>
  >;

  fetchAllObligationChangesByRegulator: (
    taskRegulatorIdMap: Map<string, RegulatorId>
  ) => Promise<Map<RegulatorId, NewRawExternalObligationChange[]>>;

  persistObligationChangesByRegulator: (
    ingestionRunId: IngestionRunId,
    obligationChangesByRegulator: Map<
      RegulatorId,
      NewRawExternalObligationChange[]
    >
  ) => Promise<void>;

  persistTasksByRegulator: (
    ingestionRunId: IngestionRunId,
    tasksByRegulator: Map<RegulatorId, NewRawExternalObligation[]>
  ) => Promise<void>;
}

export const createPrefetchTasksUseCase = ({
  getIngestionRun,
  updateIngestionRun,
  fetchAllTasksByRegulator,
  persistTasksByRegulator,
  fetchAllObligationChangesByRegulator,
  persistObligationChangesByRegulator,
}: Dependencies) => {
  const buildTaskRegulatorIdMap = (
    tasksByRegulator: Map<RegulatorId, NewRawExternalObligation[]>
  ): Map<string, RegulatorId> => {
    const map = new Map<string, RegulatorId>();

    for (const [regulatorId, tasks] of tasksByRegulator.entries()) {
      for (const task of tasks) {
        map.set(task.externalId, regulatorId);
      }
    }

    return map;
  };

  const countItems = (map: Map<RegulatorId, unknown[]>): number => {
    return Array.from(map.values()).reduce(
      (sum, items) => sum + items.length,
      0
    );
  };

  const execute = async (
    ingestionRunId: IngestionRunId
  ): Promise<IngestionRun> => {
    logger.info('Starting prefetch', { ingestionRunId });
    const ingestionRun = await getIngestionRun(ingestionRunId);

    if (ingestionRun === null) {
      logger.error('Ingestion run not found', { ingestionRunId });
      throw new Error('Ingestion run not found');
    }

    const prefetchedIngestionRun = await updateIngestionRun(
      startPrefetching(ingestionRun)
    );

    try {
      const tasksByRegulator = await fetchAllTasksByRegulator();
      await persistTasksByRegulator(ingestionRunId, tasksByRegulator);
      const totalTaskCount = countItems(tasksByRegulator);

      const taskRegulatorIdMap = buildTaskRegulatorIdMap(tasksByRegulator);

      const obligationChangesByRegulator =
        await fetchAllObligationChangesByRegulator(taskRegulatorIdMap);

      await persistObligationChangesByRegulator(
        ingestionRunId,
        obligationChangesByRegulator
      );

      const totalObligationChangeCount = countItems(
        obligationChangesByRegulator
      );

      const prefetchCompleteIngestionRun = await updateIngestionRun(
        completePrefetch(
          prefetchedIngestionRun,
          totalTaskCount,
          totalObligationChangeCount
        )
      );

      logger.info('Prefetch complete', {
        ingestionRunId,
        totalTaskCount,
        totalObligationChangeCount,
      });

      return prefetchCompleteIngestionRun;
    } catch (error) {
      logger.error('Error during prefetch', {
        ingestionRunId,
        error,
      });

      await updateIngestionRun(
        failIngestionRun(
          prefetchedIngestionRun,
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during prefetch'
        )
      );

      throw error;
    }
  };

  return { execute };
};
