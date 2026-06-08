import type { IngestionRunId, ManifestRegulatorEntry } from 'src/domain/types';
import type { ProviderName } from 'src/domain/types/provider';
import type { createChangeDetectionUseCase } from 'src/use-cases/change-detection';
import type { createConcludeIngestionUseCase } from 'src/use-cases/conclude-ingestion';
import type { createIngestAscentRulebooksUseCase } from 'src/use-cases/ingest-ascent-rulebooks';
import type { createIngestObligationChangesUseCase } from 'src/use-cases/ingest-obligation-changes';
import type { createInitialiseIngestionUseCase } from 'src/use-cases/initialise-ingestion';
import type { createPrefetchTasksUseCase } from 'src/use-cases/prefetch-tasks';

export interface PipelineUseCases {
  initialiseIngestionRun: ReturnType<typeof createInitialiseIngestionUseCase>;
  prefetchTasks: ReturnType<typeof createPrefetchTasksUseCase>;
  ingestRulebooks: ReturnType<typeof createIngestAscentRulebooksUseCase>;
  ingestObligationChanges: ReturnType<
    typeof createIngestObligationChangesUseCase
  >;
  changeDetection: ReturnType<typeof createChangeDetectionUseCase>;
  concludeIngestion: ReturnType<typeof createConcludeIngestionUseCase>;
}

export interface PipelineOptions {
  orgKey: string;
  tenant: string;
  providerName: ProviderName;
  onProgress?: (step: string, detail?: string) => void;
}

export interface PipelineResult {
  ingestionRunId: IngestionRunId;
  manifestEntries: ManifestRegulatorEntry[];
  manifestLocation: string;
}

export const runIngestionPipeline = async (
  useCases: PipelineUseCases,
  options: PipelineOptions
): Promise<PipelineResult> => {
  const { onProgress } = options;

  onProgress?.('initialise');
  const ingestionRun = await useCases.initialiseIngestionRun.execute({
    providerName: options.providerName,
    orgKey: options.orgKey,
    tenant: options.tenant,
  });

  if (ingestionRun.regulatorProgress.length === 0) {
    const concludeResult = await useCases.concludeIngestion.execute(
      ingestionRun.id,
      []
    );

    return {
      ingestionRunId: concludeResult.ingestionRun.id,
      manifestEntries: [],
      manifestLocation: concludeResult.manifestLocation,
    };
  }

  onProgress?.('prefetch');
  const prefetchResult = await useCases.prefetchTasks.execute(ingestionRun.id);

  const regulatorIds = prefetchResult.regulatorProgress.map(
    (r) => r.regulatorId
  );

  onProgress?.('ingest');
  for (const regulatorId of regulatorIds) {
    const regulator = prefetchResult.regulatorProgress.find(
      (r) => r.regulatorId === regulatorId
    );
    onProgress?.('ingest:regulator', regulator?.regulatorName ?? regulatorId);
    await useCases.ingestRulebooks.execute(prefetchResult.id, regulatorId);
    await useCases.ingestObligationChanges.execute(
      prefetchResult.id,
      regulatorId
    );
  }

  onProgress?.('detect-changes');
  const manifestEntries: ManifestRegulatorEntry[] = [];
  for (const regulatorId of regulatorIds) {
    const regulator = prefetchResult.regulatorProgress.find(
      (r) => r.regulatorId === regulatorId
    );
    onProgress?.(
      'detect-changes:regulator',
      regulator?.regulatorName ?? regulatorId
    );
    const result = await useCases.changeDetection.execute(
      prefetchResult.id,
      regulatorId
    );
    manifestEntries.push(result.manifestEntry);
  }

  onProgress?.('conclude');
  const concludeResult = await useCases.concludeIngestion.execute(
    prefetchResult.id,
    manifestEntries
  );

  return {
    ingestionRunId: concludeResult.ingestionRun.id,
    manifestEntries,
    manifestLocation: concludeResult.manifestLocation,
  };
};
