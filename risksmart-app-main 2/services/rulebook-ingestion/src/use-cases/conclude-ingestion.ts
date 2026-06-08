import {
  completeIngestionRun,
  type IngestionManifest,
  type IngestionRun,
  type IngestionRunId,
  type ManifestRegulatorEntry,
} from 'src/domain/types';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface Dependencies {
  getIngestionRun: (
    ingestionRunId: IngestionRunId
  ) => Promise<IngestionRun | null>;

  saveIngestionRun: (ingestionRun: IngestionRun) => Promise<IngestionRun>;

  exportManifest: (
    manifest: IngestionManifest
  ) => Promise<{ location: string }>;

  emitChangeEvent: (
    ingestionRun: IngestionRun,
    manifestLocation: string
  ) => Promise<void>;
}

export const createConcludeIngestionUseCase = ({
  getIngestionRun,
  saveIngestionRun,
  exportManifest,
  emitChangeEvent,
}: Dependencies) => {
  const execute = async (
    ingestionRunId: IngestionRunId,
    manifestEntries: ManifestRegulatorEntry[]
  ): Promise<{ ingestionRun: IngestionRun; manifestLocation: string }> => {
    const ingestionRun = await getIngestionRun(ingestionRunId);

    if (!ingestionRun) {
      throw new Error(`Ingestion run not found: ${ingestionRunId}`);
    }

    const manifest: IngestionManifest = {
      runId: ingestionRun.id,
      providerName: ingestionRun.providerName,
      regulators: manifestEntries,
      completedAtTimestamp: new Date().toISOString(),
    };

    const { location: manifestLocation } = await exportManifest(manifest);

    logger.info('Exported manifest', {
      ingestionRunId: ingestionRun.id,
      manifestLocation,
    });

    await emitChangeEvent(ingestionRun, manifestLocation);

    const completedIngestionRun = await saveIngestionRun(
      completeIngestionRun(ingestionRun, manifestLocation)
    );

    return { ingestionRun: completedIngestionRun, manifestLocation };
  };

  return {
    execute,
  };
};
