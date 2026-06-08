import type { IngestionRun } from 'src/domain/types';
import { buildIngestionRun } from 'test/builders/ingestion-run-builder';

import { createPrefetchTasksUseCase } from './prefetch-tasks';

describe('Prefetch Tasks', () => {
  it('should set the ingestion phase to prefetching', async () => {
    const mockRun = buildIngestionRun();
    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);

    const mockUpdateIngestionRun = vi
      .fn()
      .mockImplementation(async (run: IngestionRun) => {
        return Promise.resolve(run);
      });

    const useCase = createPrefetchTasksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      fetchAllTasksByRegulator: vi.fn().mockResolvedValue(new Map()),
      persistTasksByRegulator: vi
        .fn()
        .mockResolvedValue({ location: 'mock-location' }),
      fetchAllObligationChangesByRegulator: vi
        .fn()
        .mockResolvedValue(new Map()),
      persistObligationChangesByRegulator: vi.fn(),
    });

    await useCase.execute(mockRun.id);

    expect(mockUpdateIngestionRun).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: expect.objectContaining({
          type: 'prefetching',
        }),
      })
    );
  });

  it('should fetch all tasks by regulator', async () => {
    const mockRun = buildIngestionRun();

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi
      .fn()
      .mockImplementation(async (run: IngestionRun) => {
        return Promise.resolve(run);
      });
    const mockFetchAllTasksByRegulator = vi.fn().mockResolvedValue(new Map());

    const useCase = createPrefetchTasksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      fetchAllTasksByRegulator: mockFetchAllTasksByRegulator,
      persistTasksByRegulator: vi
        .fn()
        .mockResolvedValue({ location: 'mock-location' }),
      fetchAllObligationChangesByRegulator: vi
        .fn()
        .mockResolvedValue(new Map()),
      persistObligationChangesByRegulator: vi.fn(),
    });

    await useCase.execute(mockRun.id);

    expect(mockFetchAllTasksByRegulator).toHaveBeenCalledOnce();
  });

  it('should store the fetched tasks against the ingestion run', async () => {
    const mockRun = buildIngestionRun();
    const mockTasks = new Map([
      ['regulator-1', [{ externalId: 'task-1' }]],
      ['regulator-2', [{ externalId: 'task-2' }]],
    ]);

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi
      .fn()
      .mockImplementation(async (run: IngestionRun) => {
        return Promise.resolve(run);
      });
    const mockPersistTasksByRegulator = vi
      .fn()
      .mockResolvedValue({ location: 'mock-location' });

    const useCase = createPrefetchTasksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      fetchAllTasksByRegulator: vi.fn().mockResolvedValue(mockTasks),
      persistTasksByRegulator: mockPersistTasksByRegulator,
      fetchAllObligationChangesByRegulator: vi
        .fn()
        .mockResolvedValue(new Map()),
      persistObligationChangesByRegulator: vi.fn(),
    });

    await useCase.execute(mockRun.id);

    expect(mockPersistTasksByRegulator).toHaveBeenCalledWith(
      mockRun.id,
      mockTasks
    );
  });

  it('should set the ingestion phase to prefetch_complete when prefetching is complete', async () => {
    const mockRun = buildIngestionRun();
    const mockLocation = 's3://bucket/ingestion-runs/run-123/tasks';
    const mockTasks = new Map([
      ['regulator-1', [{ externalId: 'task-1' }]],
      ['regulator-2', [{ externalId: 'task-2' }]],
      ['regulator-3', [{ externalId: 'task-3' }]],
    ]);

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi
      .fn()
      .mockImplementation(async (run: IngestionRun) => {
        return Promise.resolve(run);
      });

    const useCase = createPrefetchTasksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      fetchAllTasksByRegulator: vi.fn().mockResolvedValue(mockTasks),
      persistTasksByRegulator: vi
        .fn()
        .mockResolvedValue({ location: mockLocation }),
      fetchAllObligationChangesByRegulator: vi
        .fn()
        .mockResolvedValue(new Map()),
      persistObligationChangesByRegulator: vi.fn(),
    });

    await useCase.execute(mockRun.id);

    // Should have been called twice: once for prefetching, once for prefetch_complete
    expect(mockUpdateIngestionRun).toHaveBeenCalledTimes(2);

    // Check the final call for prefetch_complete phase
    expect(mockUpdateIngestionRun).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: expect.objectContaining({
          type: 'prefetch_complete',
          totalTaskCount: 3, // Total number of tasks across all regulators
        }),
      })
    );
  });

  it('should fetch and persist obligation changes by regulator', async () => {
    const mockRun = buildIngestionRun();
    const mockTasks = new Map([
      ['regulator-1', [{ externalId: 'task-1' }, { externalId: 'task-2' }]],
      ['regulator-2', [{ externalId: 'task-3' }]],
    ]);
    const mockObligationChanges = new Map([
      ['regulator-1', [{ externalId: 'change-1' }]],
      ['regulator-2', [{ externalId: 'change-2' }, { externalId: 'change-3' }]],
    ]);

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi
      .fn()
      .mockImplementation(async (run: IngestionRun) => Promise.resolve(run));
    const mockFetchAllObligationChangesByRegulator = vi
      .fn()
      .mockResolvedValue(mockObligationChanges);
    const mockPersistObligationChangesByRegulator = vi
      .fn()
      .mockResolvedValue(undefined);

    const useCase = createPrefetchTasksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      fetchAllTasksByRegulator: vi.fn().mockResolvedValue(mockTasks),
      persistTasksByRegulator: vi.fn().mockResolvedValue(undefined),
      fetchAllObligationChangesByRegulator:
        mockFetchAllObligationChangesByRegulator,
      persistObligationChangesByRegulator:
        mockPersistObligationChangesByRegulator,
    });

    await useCase.execute(mockRun.id);

    // taskRegulatorIdMap is built by inverting tasksByRegulator: task.externalId → regulatorId
    const expectedTaskRegulatorIdMap = new Map([
      ['task-1', 'regulator-1'],
      ['task-2', 'regulator-1'],
      ['task-3', 'regulator-2'],
    ]);
    expect(mockFetchAllObligationChangesByRegulator).toHaveBeenCalledWith(
      expectedTaskRegulatorIdMap
    );
    expect(mockPersistObligationChangesByRegulator).toHaveBeenCalledWith(
      mockRun.id,
      mockObligationChanges
    );
  });

  it('should include obligation changes in the total count for prefetch complete', async () => {
    const mockRun = buildIngestionRun();
    const mockTasks = new Map([
      ['regulator-1', [{ externalId: 'task-1' }, { externalId: 'task-2' }]],
    ]);
    const mockObligationChanges = new Map([
      [
        'regulator-1',
        [
          { externalId: 'change-1' },
          { externalId: 'change-2' },
          { externalId: 'change-3' },
        ],
      ],
    ]);

    const mockGetIngestionRun = vi.fn().mockResolvedValue(mockRun);
    const mockUpdateIngestionRun = vi
      .fn()
      .mockImplementation(async (run: IngestionRun) => Promise.resolve(run));

    const useCase = createPrefetchTasksUseCase({
      getIngestionRun: mockGetIngestionRun,
      updateIngestionRun: mockUpdateIngestionRun,
      fetchAllTasksByRegulator: vi.fn().mockResolvedValue(mockTasks),
      persistTasksByRegulator: vi.fn().mockResolvedValue(undefined),
      fetchAllObligationChangesByRegulator: vi
        .fn()
        .mockResolvedValue(mockObligationChanges),
      persistObligationChangesByRegulator: vi.fn().mockResolvedValue(undefined),
    });

    await useCase.execute(mockRun.id);

    expect(mockUpdateIngestionRun).toHaveBeenLastCalledWith(
      expect.objectContaining({
        id: mockRun.id,
        phase: expect.objectContaining({
          type: 'prefetch_complete',
          totalTaskCount: 2,
          totalObligationChangeCount: 3,
        }),
      })
    );
  });
});
