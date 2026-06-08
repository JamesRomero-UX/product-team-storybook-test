import MockDate from 'mockdate';
import type { IngestionRun, RegulatorProgress } from 'src/domain/types';
import { type Regulator, regulatorSchema } from 'src/domain/types';
import {
  buildIngestionRun,
  withIngestingPhase,
  withRegulatorProgress,
} from 'test/builders/ingestion-run-builder';

import { createChangeDetectionUseCase } from './change-detection';

beforeEach(() => {
  MockDate.set(new Date(2025, 0, 1));
});

const mockRegulator: Regulator = regulatorSchema.parse({
  id: 'reg-1',
  name: 'Test Regulator',
});

const mockObligation = {
  externalId: 'external-1',
  contentHash: 'hash-1',
  title: 'Test Obligation',
  type: 'rule' as const,
  provider: 'ascent',
  externalRegulatorId: mockRegulator.id,
  regulatorName: mockRegulator.name,
};

describe('Change detection Handler', () => {
  it('should process each regulator and return a manifest entry of changes', async () => {
    const mockRun = buildIngestionRun(
      withRegulatorProgress([
        {
          regulatorId: mockRegulator.id,
          regulatorName: mockRegulator.name,
          batchesProcessed: 1,
          recordsProcessed: 100,
          standardsCreated: 1,
          chaptersCreated: 2,
          rulesCreated: 50,
          tasksCreated: 47,
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
        } satisfies RegulatorProgress,
      ]),
      withIngestingPhase()
    );

    const mockDetectChangesForRegulator = vi.fn().mockResolvedValue({
      added: [mockObligation],
      updated: [],
      removed: [],
    });

    const mockExportRegulatorChanges = vi.fn().mockResolvedValue({
      location: `s3://bucket/run-id/regulators/${mockRegulator.id}.json`,
    });

    const handler = createChangeDetectionUseCase({
      getIngestionRun: vi.fn().mockResolvedValue(mockRun),
      saveIngestionRun: vi
        .fn()
        .mockImplementation(
          async (run: IngestionRun) => await Promise.resolve(run)
        ),
      getLastSuccessfulIngestionRun: vi.fn().mockResolvedValue(null), // no previous run
      detectChangesForObligations: mockDetectChangesForRegulator,
      detectChangesForObligationChanges: vi
        .fn()
        .mockResolvedValue({ added: [], updated: [], removed: [] }),
      exportRegulatorChanges: mockExportRegulatorChanges,
    });

    const result = await handler.execute(mockRun.id, mockRegulator.id);

    // Verify change detection called for the regulator
    expect(mockDetectChangesForRegulator).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockRun.id }),
      null, // no previous run
      mockRegulator.id
    );

    // Verify per-regulator export
    expect(mockExportRegulatorChanges).toHaveBeenCalledWith(
      mockRun.id,
      mockRegulator.id,
      expect.objectContaining({
        previousRunId: null,
        regulatorId: mockRegulator.id,
        providerName: 'ascent',
        obligations: {
          added: [mockObligation],
          updated: [],
          removed: [],
        },
        obligationChanges: {
          added: [],
          updated: [],
          removed: [],
        },
      })
    );

    expect(result.manifestEntry).toMatchObject(
      expect.objectContaining({
        id: mockRegulator.id,
        location: `s3://bucket/run-id/regulators/${mockRegulator.id}.json`,
        obligations: { added: 1, updated: 0, removed: 0 },
        obligationChanges: { added: 0, updated: 0, removed: 0 },
      })
    );
  });
});
