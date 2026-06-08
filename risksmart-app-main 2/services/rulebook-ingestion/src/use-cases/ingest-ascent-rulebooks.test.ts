import MockDate from 'mockdate';
import type { Regulator, RegulatorId } from 'src/domain/types';
import { buildIngestionRun } from 'test/builders/ingestion-run-builder';

import { createIngestAscentRulebooksUseCase } from './ingest-ascent-rulebooks';

beforeEach(() => {
  MockDate.set(new Date(2025, 0, 1));
});

const mockRegulator: Regulator = {
  id: 'regulator-1' as RegulatorId,
  name: 'Regulator 1',
};

describe('Ingest Ascent Rulebooks Handler', () => {
  it('should fetch tasks and ingest them', async () => {
    const mockRun = buildIngestionRun();
    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorTasks = vi.fn().mockResolvedValue([]);
    const mockIngestRegulatorData = vi.fn().mockResolvedValue(undefined);

    const handler = createIngestAscentRulebooksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      loadRegulatorTasks: mockLoadRegulatorTasks,
      ingestRegulatorData: mockIngestRegulatorData,
    });

    await handler.execute(mockRun.id, mockRegulator.id);

    // Verify tasks fetched
    expect(mockLoadRegulatorTasks).toHaveBeenCalledTimes(1);

    // Verify regulator data ingested for each regulator
    expect(mockIngestRegulatorData).toHaveBeenCalledTimes(1);
    expect(mockIngestRegulatorData).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        providerName: 'ascent',
        phase: expect.objectContaining({
          type: 'ingesting',
        }),
        // Should have regulator added to progress
        regulatorProgress: expect.arrayContaining([
          expect.objectContaining({
            regulatorId: mockRegulator.id,
            regulatorName: mockRegulator.name,
          }),
        ]),
      }),
      mockRegulator.id,
      [], // No tasks for this regulator
      expect.any(Function)
    );
  });

  it('should mark run as failed when ingestRegulatorData throws', async () => {
    const mockRun = buildIngestionRun();

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorTasks = vi.fn().mockResolvedValue([]);
    const mockIngestRegulatorData = vi
      .fn()
      .mockRejectedValue(new Error('Ingestion failed'));

    const handler = createIngestAscentRulebooksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      loadRegulatorTasks: mockLoadRegulatorTasks,
      ingestRegulatorData: mockIngestRegulatorData,
    });

    await expect(handler.execute(mockRun.id, mockRegulator.id)).rejects.toThrow(
      'Ingestion failed'
    );

    // Verify updateIngestionRun called with error status
    expect(mockUpdateIngestionRun).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: {
          enteredAt: '2025-01-01T00:00:00.000Z',
          error: 'Ingestion failed',
          failedAtPhase: 'ingesting',
          type: 'failed',
        },
      })
    );
  });

  it('should mark run as failed when LoadRegulatorTasks throws', async () => {
    const mockRun = buildIngestionRun();
    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorTasks = vi
      .fn()
      .mockRejectedValue(new Error('Task fetch failed'));
    const mockIngestRegulatorData = vi.fn().mockResolvedValue(undefined);

    const handler = createIngestAscentRulebooksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      loadRegulatorTasks: mockLoadRegulatorTasks,
      ingestRegulatorData: mockIngestRegulatorData,
    });

    await expect(handler.execute(mockRun.id, mockRegulator.id)).rejects.toThrow(
      'Task fetch failed'
    );

    // Verify updateIngestionRun called with error status
    expect(mockUpdateIngestionRun).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: {
          enteredAt: '2025-01-01T00:00:00.000Z',
          error: 'Task fetch failed',
          failedAtPhase: 'ingesting',
          type: 'failed',
        },
      })
    );
  });
});
