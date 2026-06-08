import type {
  IngestionRun,
  IngestionRunId,
  ManifestRegulatorEntry,
  Obligation,
  RegulatorChangeResult,
  RegulatorId,
} from 'src/domain/types';
import {
  completeChangeDetection,
  ensureRegulatorExistsOrThrow,
  failIngestionRun,
  startChangeDetection,
} from 'src/domain/types';
import type { ObligationChange } from 'src/domain/types/obligation-change';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface Dependencies {
  getIngestionRun: (
    ingestionRunId: IngestionRunId
  ) => Promise<IngestionRun | null>;

  saveIngestionRun: (ingestionRun: IngestionRun) => Promise<IngestionRun>;

  getLastSuccessfulIngestionRun: (
    orgKey: string,
    providerName: string
  ) => Promise<IngestionRun | null>;

  detectChangesForObligations: (
    ingestionRun: IngestionRun,
    baselineRun: IngestionRun | null,
    regulatorId: RegulatorId
  ) => Promise<{
    added: Obligation[];
    updated: Obligation[];
    removed: Obligation[];
  }>;

  detectChangesForObligationChanges: (
    ingestionRun: IngestionRun,
    baselineRun: IngestionRun | null,
    regulatorId: RegulatorId
  ) => Promise<{
    added: ObligationChange[];
    updated: ObligationChange[];
    removed: ObligationChange[];
  }>;

  exportRegulatorChanges: (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId,
    changes: RegulatorChangeResult
  ) => Promise<{ location: string }>;
}

export const createChangeDetectionUseCase = ({
  getIngestionRun,
  saveIngestionRun,
  getLastSuccessfulIngestionRun,
  detectChangesForObligations,
  detectChangesForObligationChanges,
  exportRegulatorChanges,
}: Dependencies) => {
  const execute = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ): Promise<{
    ingestionRun: IngestionRun;
    manifestEntry: ManifestRegulatorEntry;
  }> => {
    logger.info('Executing change detection', {
      ingestionRunId,
      regulatorId,
    });
    // todo the get ingestion and check for regulator part is duplicated from ingest use case,
    // we should consider if we can unify that logic in a way that makes sense.
    let ingestionRun = await getIngestionRun(ingestionRunId);

    if (ingestionRun === null) {
      logger.error('Ingestion run not found', { ingestionRunId });
      throw new Error(`Ingestion run not found`);
    }

    const regulator = ensureRegulatorExistsOrThrow(ingestionRun, regulatorId);

    ingestionRun = await saveIngestionRun(startChangeDetection(ingestionRun));

    try {
      const previousRun = await getLastSuccessfulIngestionRun(
        ingestionRun.orgKey,
        ingestionRun.providerName
      );

      ingestionRun = await saveIngestionRun({
        ...ingestionRun,
        previousRunId: previousRun?.id ?? null,
      });

      // Opportunity for optimisation: we could run change detection steps in parallel since they are independent operations,
      // but doing so would make ingestion run updates more difficult (race conditions)
      const obligationChangeResults = await detectChangesForObligations(
        ingestionRun,
        previousRun,
        regulatorId
      );

      const obligationChangeChangeResults =
        await detectChangesForObligationChanges(
          ingestionRun,
          previousRun,
          regulatorId
        );

      const exportedObligationChangeResults = await exportRegulatorChanges(
        ingestionRun.id,
        regulatorId,
        {
          obligations: obligationChangeResults,
          obligationChanges: obligationChangeChangeResults,
          regulatorId,
          providerName: ingestionRun.providerName,
          previousRunId: previousRun?.id ?? null,
        }
      );

      const manifestEntry: ManifestRegulatorEntry = {
        id: regulatorId,
        name: regulator.name,
        location: exportedObligationChangeResults.location,
        obligations: {
          added: obligationChangeResults.added.length,
          updated: obligationChangeResults.updated.length,
          removed: obligationChangeResults.removed.length,
        },
        obligationChanges: {
          added: obligationChangeChangeResults.added.length,
          updated: obligationChangeChangeResults.updated.length,
          removed: obligationChangeChangeResults.removed.length,
        },
      };

      ingestionRun = await saveIngestionRun(
        completeChangeDetection(ingestionRun, regulatorId, {
          obligations: manifestEntry.obligations,
          obligationChanges: manifestEntry.obligationChanges,
        })
      );

      logger.info('Completed change detection', {
        ingestionRunId: ingestionRun.id,
        regulatorId,
        manifestEntry,
      });

      return { ingestionRun, manifestEntry };
    } catch (error) {
      logger.error(
        'Error during change detection phase of ascent rulebooks ingestion run',
        {
          ingestionRunId: ingestionRun.id,
          provider: ingestionRun.providerName,
          error,
        }
      );

      await saveIngestionRun(
        failIngestionRun(
          ingestionRun,
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during change detection phase'
        )
      );

      throw error;
    }
  };

  return { execute };
};
