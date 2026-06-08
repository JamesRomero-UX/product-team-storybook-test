import type { regulatorProgressSchema } from 'src/domain/types';
import {
  type IngestionRun,
  ingestionRunIdSchema,
  ingestionRunSchema,
  type RegulatorProgress,
} from 'src/domain/types';
import { v7 as uuidv7 } from 'uuid';
import type z from 'zod';

type IngestionRunBuilder = (item: IngestionRun) => IngestionRun;

const getDefaultValue = (): IngestionRun =>
  ingestionRunSchema.parse({
    regulatorProgress: [
      {
        batchesProcessed: 0,
        chaptersCreated: 0,
        recordsProcessed: 0,
        rulesCreated: 0,
        standardsCreated: 0,
        tasksCreated: 0,
        regulatorId: 'regulator-1',
        regulatorName: 'Regulator 1',
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
      } satisfies Record<
        keyof z.input<typeof regulatorProgressSchema>,
        unknown
      >,
    ],

    completedAtTimestamp: null,
    id: uuidv7(), // generates a time-ordered UUID, which is useful for sorting runs by creation time
    previousRunId: null,
    providerName: 'ascent',
    orgKey: 'org_test',
    tenant: 'multitenant',
    startedAtTimestamp: '2025-01-01T00:00:00.000Z',
    phase: {
      type: 'initialised',
      enteredAt: '2025-01-01T00:00:00.000Z',
    },
  } satisfies Record<keyof z.input<typeof ingestionRunSchema>, unknown>);

export const buildIngestionRun = (
  ...builders: IngestionRunBuilder[]
): IngestionRun => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultValue()
  );

  return item;
};

export const withId =
  (id: string): IngestionRunBuilder =>
  (item) => ({
    ...item,
    id: ingestionRunIdSchema.parse(id),
  });

export const withStartedAtTimestamp =
  (startedAtTimestamp: string): IngestionRunBuilder =>
  (item) => ({
    ...item,
    startedAtTimestamp,
  });

export const withRegulatorProgress =
  (regulatorProgress: RegulatorProgress[]): IngestionRunBuilder =>
  (item) => ({
    ...item,
    regulatorProgress,
  });

// === Phase builders ===

export const withInitialisedPhase =
  (): IngestionRunBuilder =>
  (item: IngestionRun): IngestionRun => ({
    ...item,
    phase: {
      type: 'initialised',
      enteredAt: item.startedAtTimestamp,
    },
  });

export const withPrefetchingPhase =
  (): IngestionRunBuilder =>
  (item: IngestionRun): IngestionRun => ({
    ...item,
    phase: {
      type: 'prefetching',
      enteredAt: item.startedAtTimestamp,
    },
  });

export const withPrefetchCompletePhase =
  (totalTaskCount = 100, totalObligationChangeCount = 0): IngestionRunBuilder =>
  (item: IngestionRun): IngestionRun => ({
    ...item,
    phase: {
      type: 'prefetch_complete',
      enteredAt: item.startedAtTimestamp,
      totalTaskCount,
      totalObligationChangeCount,
    },
  });

export const withIngestingPhase =
  (): IngestionRunBuilder =>
  (item: IngestionRun): IngestionRun => ({
    ...item,
    phase: {
      type: 'ingesting',
      enteredAt: item.startedAtTimestamp,
      regulatorsInProgress: item.regulatorProgress.map((rp) => rp.regulatorId),
    },
  });

export const withChangeDetectionPhase =
  (): IngestionRunBuilder =>
  (item: IngestionRun): IngestionRun => ({
    ...item,
    phase: {
      type: 'change_detection',
      enteredAt: item.startedAtTimestamp,
    },
  });

export const withCompletedPhase =
  (resultLocation: string | null = null): IngestionRunBuilder =>
  (item: IngestionRun): IngestionRun => ({
    ...item,
    phase: {
      type: 'completed',
      enteredAt: item.completedAtTimestamp ?? new Date().toISOString(),
      resultLocation,
    },
    completedAtTimestamp: item.completedAtTimestamp ?? new Date().toISOString(),
  });

export const withFailedPhase =
  (
    error: string,
    failedAtPhase:
      | 'initialised'
      | 'prefetching'
      | 'prefetch_complete'
      | 'ingesting'
      | 'change_detection' = 'ingesting'
  ): IngestionRunBuilder =>
  (item: IngestionRun): IngestionRun => ({
    ...item,
    phase: {
      type: 'failed',
      enteredAt: item.completedAtTimestamp ?? new Date().toISOString(),
      error,
      failedAtPhase,
    },
    completedAtTimestamp: item.completedAtTimestamp ?? new Date().toISOString(),
  });
