import MockDate from 'mockdate';
import type { NewIngestionRun, Regulator, RegulatorId } from 'src/domain/types';
import {
  buildIngestionRun,
  withRegulatorProgress,
} from 'test/builders/ingestion-run-builder';

import { createInitialiseIngestionUseCase } from './initialise-ingestion';

beforeEach(() => {
  MockDate.set(new Date(2025, 0, 1));
});

const mockRegulator: Regulator = {
  id: 'reg-1' as RegulatorId,
  name: 'Test Regulator',
};

describe('Initialise ingestion use case', () => {
  it('should create ingestion run with initial regulator progress', async () => {
    const mockRun = buildIngestionRun(
      withRegulatorProgress([
        {
          regulatorId: mockRegulator.id,
          regulatorName: mockRegulator.name,
          batchesProcessed: 0,
          recordsProcessed: 0,
          chaptersCreated: 0,
          rulesCreated: 0,
          standardsCreated: 0,
          tasksCreated: 0,
          changes: {
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
        },
      ])
    );

    const mockSave = vi.fn().mockResolvedValue(mockRun);
    const mockUpdate = vi.fn().mockResolvedValue(mockRun);
    const mockGetRegulators = vi.fn().mockResolvedValue([mockRegulator]);

    const handler = createInitialiseIngestionUseCase({
      saveNewIngestionRun: mockSave,
      updateIngestionRun: mockUpdate,
      getRegulators: mockGetRegulators,
    });

    const result = await handler.execute({
      providerName: 'ascent',
      orgKey: 'test-org',
      tenant: 'test-tenant',
    });

    expect(result).toEqual(mockRun);

    // Verify run created first with correct initial state
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        providerName: 'ascent',
        orgKey: 'test-org',
        tenant: 'test-tenant',
        startedAtTimestamp: '2025-01-01T00:00:00.000Z',
        completedAtTimestamp: null,
        phase: expect.objectContaining({
          type: 'initialised',
        }),
        previousRunId: null,
        regulatorProgress: [],
      } satisfies NewIngestionRun)
    );

    // Verify regulators fetched
    expect(mockGetRegulators).toHaveBeenCalledTimes(1);
  });

  it('should mark run as failed on error', async () => {
    const mockRun = buildIngestionRun();
    const mockSave = vi.fn().mockResolvedValue(mockRun);
    const mockUpdate = vi.fn().mockResolvedValue(mockRun);
    const mockGetRegulators = vi
      .fn()
      .mockRejectedValue(new Error('Ingestion failed'));

    const handler = createInitialiseIngestionUseCase({
      saveNewIngestionRun: mockSave,
      updateIngestionRun: mockUpdate,
      getRegulators: mockGetRegulators,
    });

    await expect(
      handler.execute({
        providerName: 'ascent',
        orgKey: 'test-org',
        tenant: 'test-tenant',
      })
    ).rejects.toThrow('Ingestion failed');

    // Verify updateIngestionRun called with error status
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: expect.objectContaining({
          type: 'failed',
          error: 'Ingestion failed',
          failedAtPhase: 'initialised',
        }),
        completedAtTimestamp: '2025-01-01T00:00:00.000Z',
        providerName: 'ascent',
        previousRunId: null,
        startedAtTimestamp: '2025-01-01T00:00:00.000Z',
      })
    );
  });
});
