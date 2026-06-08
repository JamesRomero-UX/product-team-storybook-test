import {
  type ManifestRegulatorEntry,
  regulatorIdSchema,
} from 'src/domain/types';
import { buildIngestionRun } from 'test/builders/ingestion-run-builder';

import { createConcludeIngestionUseCase } from './conclude-ingestion';

describe('Conclude Ingestion Handler', () => {
  const ingestionRun = buildIngestionRun();
  const manifestEntries: ManifestRegulatorEntry[] = [
    {
      id: regulatorIdSchema.parse('regulator-1'),
      name: 'Regulator 1',
      location: '',
      obligations: {
        added: 0,
        updated: 0,
        removed: 0,
      },
      obligationChanges: {
        added: 0,
        updated: 0,
        removed: 0,
      },
    },
    {
      id: regulatorIdSchema.parse('regulator-2'),
      name: 'Regulator 2',
      location: '',
      obligations: {
        added: 0,
        updated: 0,
        removed: 0,
      },
      obligationChanges: {
        added: 0,
        updated: 0,
        removed: 0,
      },
    },
  ];

  it('should create and export the manifest', async () => {
    const mocksaveIngestionRun = vi.fn().mockResolvedValue(ingestionRun);
    const mockExportManifest = vi
      .fn()
      .mockResolvedValue({ location: 's3://bucket/manifest.json' });
    const mockEmitChangeEvent = vi.fn().mockResolvedValue(undefined);

    const useCase = createConcludeIngestionUseCase({
      getIngestionRun: vi.fn().mockResolvedValue(ingestionRun),
      saveIngestionRun: mocksaveIngestionRun,
      exportManifest: mockExportManifest,
      emitChangeEvent: mockEmitChangeEvent,
    });

    await useCase.execute(ingestionRun.id, manifestEntries);

    expect(mockExportManifest).toHaveBeenCalledWith({
      runId: ingestionRun.id,
      providerName: ingestionRun.providerName,
      regulators: manifestEntries,
      completedAtTimestamp: expect.any(String),
    });

    expect(mockEmitChangeEvent).toHaveBeenCalledWith(
      ingestionRun,
      's3://bucket/manifest.json'
    );
  });

  it('should mark the ingestion run as completed', async () => {
    const mocksaveIngestionRun = vi.fn().mockResolvedValue(ingestionRun);

    const mockExportManifest = vi
      .fn()
      .mockResolvedValue({ location: 's3://bucket/manifest.json' });
    const mockEmitChangeEvent = vi.fn().mockResolvedValue(undefined);

    const useCase = createConcludeIngestionUseCase({
      getIngestionRun: vi.fn().mockResolvedValue(ingestionRun),
      saveIngestionRun: mocksaveIngestionRun,
      exportManifest: mockExportManifest,
      emitChangeEvent: mockEmitChangeEvent,
    });

    await useCase.execute(ingestionRun.id, manifestEntries);

    expect(mocksaveIngestionRun).toHaveBeenCalledWith(
      expect.objectContaining({
        id: ingestionRun.id,
        phase: expect.objectContaining({
          type: 'completed',
        }),
      })
    );
  });
});
