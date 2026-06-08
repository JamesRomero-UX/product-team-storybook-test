import MockDate from 'mockdate';
import type { Regulator, RegulatorId } from 'src/domain/types';
import {
  type ObligationChange,
  obligationChangeSchema,
} from 'src/domain/types/obligation-change';
import { buildIngestionRun } from 'test/builders/ingestion-run-builder';

import { createIngestObligationChangesUseCase } from './ingest-obligation-changes';

beforeEach(() => {
  MockDate.set(new Date(2025, 0, 1));
});

const mockRegulator: Regulator = {
  id: 'regulator-1' as RegulatorId,
  name: 'Regulator 1',
};

const buildObligationChange = (
  externalId: string,
  effectiveDate?: string
): ObligationChange =>
  obligationChangeSchema.parse({
    externalId,
    externalParentId: 'parent-task-1',
    contentHash: `hash-${externalId}`,
    description: {
      before: `Description before change for ${externalId}`,
      after: `Description after change for ${externalId}`,
    },
    regulatorId: mockRegulator.id,
    effectiveDate,
  } satisfies ObligationChange);

describe('Ingest Obligation Changes use case', () => {
  it('should load obligation changes for the regulator and save them', async () => {
    const mockRun = buildIngestionRun();
    const mockObligationChanges = [
      buildObligationChange('oc-1', '2025-06-01'),
      buildObligationChange('oc-2', '2025-12-31'),
    ];

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockSaveIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorObligationChanges = vi
      .fn()
      .mockResolvedValue(mockObligationChanges);
    const mockSaveObligationChanges = vi
      .fn()
      .mockResolvedValue(mockObligationChanges);

    const useCase = createIngestObligationChangesUseCase({
      getIngestionRun: mockGetIngestionRun,
      saveIngestionRun: mockSaveIngestionRun,
      loadRegulatorObligationChanges: mockLoadRegulatorObligationChanges,
      saveObligationChanges: mockSaveObligationChanges,
    });

    await useCase.execute(mockRun.id, mockRegulator.id);

    expect(mockLoadRegulatorObligationChanges).toHaveBeenCalledTimes(1);
    expect(mockLoadRegulatorObligationChanges).toHaveBeenCalledWith(
      mockRun.id,
      mockRegulator.id
    );

    expect(mockSaveObligationChanges).toHaveBeenCalledTimes(1);
    expect(mockSaveObligationChanges).toHaveBeenCalledWith(
      mockRun.id,
      mockObligationChanges
    );
  });

  it('should only save obligation changes with a future effective date', async () => {
    const mockRun = buildIngestionRun();
    const futureChange = buildObligationChange('oc-future', '2025-06-01');
    const pastChange = buildObligationChange('oc-past', '2024-12-31');
    const todayChange = buildObligationChange('oc-today', '2025-01-01');
    const noDateChange = buildObligationChange('oc-no-date');

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockSaveIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorObligationChanges = vi
      .fn()
      .mockResolvedValue([futureChange, pastChange, todayChange, noDateChange]);
    const mockSaveObligationChanges = vi.fn().mockResolvedValue([futureChange]);

    const useCase = createIngestObligationChangesUseCase({
      getIngestionRun: mockGetIngestionRun,
      saveIngestionRun: mockSaveIngestionRun,
      loadRegulatorObligationChanges: mockLoadRegulatorObligationChanges,
      saveObligationChanges: mockSaveObligationChanges,
    });

    await useCase.execute(mockRun.id, mockRegulator.id);

    expect(mockSaveObligationChanges).toHaveBeenCalledWith(mockRun.id, [
      futureChange,
    ]);
  });

  it('should save an empty array when there are no obligation changes for the regulator', async () => {
    const mockRun = buildIngestionRun();

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockSaveIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorObligationChanges = vi.fn().mockResolvedValue(null);
    const mockSaveObligationChanges = vi.fn().mockResolvedValue([]);

    const useCase = createIngestObligationChangesUseCase({
      getIngestionRun: mockGetIngestionRun,
      saveIngestionRun: mockSaveIngestionRun,
      loadRegulatorObligationChanges: mockLoadRegulatorObligationChanges,
      saveObligationChanges: mockSaveObligationChanges,
    });

    await useCase.execute(mockRun.id, mockRegulator.id);

    expect(mockSaveObligationChanges).toHaveBeenCalledWith(mockRun.id, []);
  });

  it('should mark run as failed when saveObligationChanges throws', async () => {
    const mockRun = buildIngestionRun();

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockSaveIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorObligationChanges = vi.fn().mockResolvedValue([]);
    const mockSaveObligationChanges = vi
      .fn()
      .mockRejectedValue(new Error('Save failed'));

    const useCase = createIngestObligationChangesUseCase({
      getIngestionRun: mockGetIngestionRun,
      saveIngestionRun: mockSaveIngestionRun,
      loadRegulatorObligationChanges: mockLoadRegulatorObligationChanges,
      saveObligationChanges: mockSaveObligationChanges,
    });

    await expect(useCase.execute(mockRun.id, mockRegulator.id)).rejects.toThrow(
      'Save failed'
    );

    expect(mockSaveIngestionRun).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: {
          enteredAt: '2025-01-01T00:00:00.000Z',
          error: 'Save failed',
          failedAtPhase: 'initialised',
          type: 'failed',
        },
      })
    );
  });

  it('should mark run as failed when loadRegulatorObligationChanges throws', async () => {
    const mockRun = buildIngestionRun();

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockSaveIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockLoadRegulatorObligationChanges = vi
      .fn()
      .mockRejectedValue(new Error('Load failed'));
    const mockSaveObligationChanges = vi.fn().mockResolvedValue([]);

    const useCase = createIngestObligationChangesUseCase({
      getIngestionRun: mockGetIngestionRun,
      saveIngestionRun: mockSaveIngestionRun,
      loadRegulatorObligationChanges: mockLoadRegulatorObligationChanges,
      saveObligationChanges: mockSaveObligationChanges,
    });

    await expect(useCase.execute(mockRun.id, mockRegulator.id)).rejects.toThrow(
      'Load failed'
    );

    expect(mockSaveIngestionRun).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: {
          enteredAt: '2025-01-01T00:00:00.000Z',
          error: 'Load failed',
          failedAtPhase: 'initialised',
          type: 'failed',
        },
      })
    );
  });
});
