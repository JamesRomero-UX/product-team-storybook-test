import type {
  IngestionProgressDelta,
  IngestionRun,
  IngestionRunId,
  NewRawExternalObligation,
  RegulatorId,
} from 'src/domain/types';
import {
  applyProgressDelta,
  ensureRegulatorExistsOrThrow,
  failIngestionRun,
  startIngesting,
} from 'src/domain/types';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface Dependencies {
  getIngestionRun: (
    ingestionRunId: IngestionRunId
  ) => Promise<IngestionRun | null>;

  updateIngestionRun: (ingestionRun: IngestionRun) => Promise<IngestionRun>;

  loadRegulatorTasks: (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ) => Promise<NewRawExternalObligation[] | null>;

  ingestRegulatorData: (
    ingestionRun: IngestionRun,
    regulatorId: RegulatorId,
    regulatorTasks: NewRawExternalObligation[],
    onProgress: (
      ingestionProgressDelta: IngestionProgressDelta
    ) => Promise<void>
  ) => Promise<void>;
}

export const createIngestAscentRulebooksUseCase = ({
  getIngestionRun,
  updateIngestionRun,
  loadRegulatorTasks,
  ingestRegulatorData,
}: Dependencies) => {
  const execute = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ): Promise<IngestionRun> => {
    // future enhancement would be to make the mutation of ingestionRun more robust and explicit.
    // Right now we're in danger of accidentally losing progress updates if we're not careful to apply them to the most recently saved version of ingestionRun, which is a bit error prone.
    let ingestionRun = await getIngestionRun(ingestionRunId);

    if (ingestionRun === null) {
      logger.error('Ingestion run not found', { ingestionRunId });
      throw new Error(`Ingestion run not found`);
    }

    ensureRegulatorExistsOrThrow(ingestionRun, regulatorId);

    ingestionRun = startIngesting(ingestionRun);
    await updateIngestionRun(ingestionRun);

    logger.info('Starting rulebooks ingestion run', {
      ingestionRunId: ingestionRun.id,
      provider: ingestionRun.providerName,
      regulatorId,
    });

    try {
      const handleProgressUpdates = async (
        ingestionProgressDelta: IngestionProgressDelta
      ) => {
        ingestionRun = applyProgressDelta(
          // ingestionRun cannot be null here — null check on line 54 threw, and startIngesting always returns IngestionRun.
          // TypeScript cannot narrow mutable variables across closure boundaries.
          ingestionRun as IngestionRun,
          ingestionProgressDelta
        );

        logger.debug('Ingestion progress update', ingestionRun);

        await updateIngestionRun(ingestionRun);
      };

      const tasksByRegulator = await loadRegulatorTasks(
        ingestionRunId,
        regulatorId
      );

      logger.info('Fetched all tasks for regulator', {
        ingestionRunId,
        regulatorId,
        taskCount: tasksByRegulator ? tasksByRegulator.length : 0,
      });

      await ingestRegulatorData(
        ingestionRun,
        regulatorId,
        tasksByRegulator || [],
        handleProgressUpdates
      );

      logger.info('Completed rulebook ingestion', {
        ingestionRunId: ingestionRun.id,
        regulatorId,
      });
    } catch (error) {
      logger.error('Error during ascent rulebooks ingestion run', {
        ingestionRunId: ingestionRun.id,
        provider: ingestionRun.providerName,
        error,
      });

      await updateIngestionRun(
        failIngestionRun(
          ingestionRun,
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during ingestion run'
        )
      );

      throw error;
    }

    return ingestionRun;
  };

  return { execute };
};
