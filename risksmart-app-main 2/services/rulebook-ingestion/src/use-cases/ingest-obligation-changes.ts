import { isAfter, parseISO } from 'date-fns';
import type {
  IngestionRun,
  IngestionRunId,
  RegulatorId,
} from 'src/domain/types';
import {
  ensureRegulatorExistsOrThrow,
  failIngestionRun,
} from 'src/domain/types';
import type { ObligationChange } from 'src/domain/types/obligation-change';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface Dependencies {
  getIngestionRun: (
    ingestionRunId: IngestionRunId
  ) => Promise<IngestionRun | null>;

  saveIngestionRun: (ingestionRun: IngestionRun) => Promise<IngestionRun>;

  loadRegulatorObligationChanges: (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ) => Promise<ObligationChange[] | null>;

  saveObligationChanges: (
    ingestionRunId: IngestionRunId,
    obligationChanges: ObligationChange[]
  ) => Promise<ObligationChange[]>;
}

export const createIngestObligationChangesUseCase = ({
  getIngestionRun,
  saveIngestionRun,
  loadRegulatorObligationChanges,
  saveObligationChanges,
}: Dependencies) => {
  const execute = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ): Promise<IngestionRun> => {
    const ingestionRun = await getIngestionRun(ingestionRunId);

    if (ingestionRun === null) {
      logger.error('Ingestion run not found', { ingestionRunId });
      throw new Error(`Ingestion run not found`);
    }

    ensureRegulatorExistsOrThrow(ingestionRun, regulatorId);

    try {
      const obligationChanges = await loadRegulatorObligationChanges(
        ingestionRun.id,
        regulatorId
      );

      logger.info('Fetched all obligation changes for regulator', {
        ingestionRunId: ingestionRunId,
        regulatorId,
        obligationChangeCount: obligationChanges ? obligationChanges.length : 0,
      });

      const now = new Date();
      const filteredObligationChanges =
        obligationChanges?.filter(
          (obligationChange) =>
            obligationChange.effectiveDate != null &&
            isAfter(parseISO(obligationChange.effectiveDate), now)
        ) || [];

      logger.info('Filtered obligation changes to future effective dates', {
        ingestionRunId: ingestionRunId,
        regulatorId,
        unfilteredObligationChangeCount: obligationChanges
          ? obligationChanges.length
          : 0,
        filteredObligationChangeCount: filteredObligationChanges.length,
      });

      await saveObligationChanges(ingestionRunId, filteredObligationChanges);

      logger.info('Completed obligation change ingestion', {
        ingestionRunId: ingestionRunId,
        regulatorId,
      });
    } catch (error) {
      logger.error('Error during obligation change ingestion run', {
        ingestionRunId: ingestionRunId,
        provider: ingestionRun.providerName,
        error,
      });

      await saveIngestionRun(
        failIngestionRun(
          ingestionRun,
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during obligation change ingestion run'
        )
      );

      throw error;
    }

    return ingestionRun;
  };

  return { execute };
};
