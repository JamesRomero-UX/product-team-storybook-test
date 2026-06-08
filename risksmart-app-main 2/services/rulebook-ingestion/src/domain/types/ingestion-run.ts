import z from 'zod';

import type { ProviderName } from './provider';
import { providerNameSchema } from './provider';
import type { RegulatorId } from './regulator';
import { type Regulator, regulatorIdSchema } from './regulator';

export const ingestionRunIdSchema = z.string().uuid().brand<'IngestionRunId'>();
export type IngestionRunId = z.infer<typeof ingestionRunIdSchema>;

const basePhaseSchema = z.object({
  enteredAt: z.string(),
});

const initialisedPhaseSchema = basePhaseSchema.extend({
  type: z.literal('initialised'),
});

const prefetchingPhaseSchema = basePhaseSchema.extend({
  type: z.literal('prefetching'),
});

const prefetchCompletePhaseSchema = basePhaseSchema.extend({
  type: z.literal('prefetch_complete'),
  totalTaskCount: z.number().int(),
  totalObligationChangeCount: z.number().int(),
});

const ingestingPhaseSchema = basePhaseSchema.extend({
  type: z.literal('ingesting'),
  regulatorsInProgress: z.array(regulatorIdSchema).optional(),
});

const changeDetectionPhaseSchema = basePhaseSchema.extend({
  type: z.literal('change_detection'),
});

const completedPhaseSchema = basePhaseSchema.extend({
  type: z.literal('completed'),
  resultLocation: z.string().nullable(),
});

const failedPhaseSchema = basePhaseSchema.extend({
  type: z.literal('failed'),
  error: z.string(),
  failedAtPhase: z.enum([
    'initialised',
    'prefetching',
    'prefetch_complete',
    'ingesting',
    'change_detection',
  ]),
});

export const ingestionPhaseSchema = z.discriminatedUnion('type', [
  initialisedPhaseSchema,
  prefetchingPhaseSchema,
  prefetchCompletePhaseSchema,
  ingestingPhaseSchema,
  changeDetectionPhaseSchema,
  completedPhaseSchema,
  failedPhaseSchema,
]);

export type IngestionPhase = z.infer<typeof ingestionPhaseSchema>;

const changeDetectionProgressSchema = z.object({
  added: z.number().int().default(0),
  updated: z.number().int().default(0),
  removed: z.number().int().default(0),
});

export const regulatorProgressSchema = z.object({
  // consider start and end times for each regulator in future to give more granular progress updates
  regulatorId: regulatorIdSchema,
  regulatorName: z.string(),

  // ingestion counts
  batchesProcessed: z.number().int().default(0),
  recordsProcessed: z.number().int().default(0),
  chaptersCreated: z.number().int().default(0),
  rulesCreated: z.number().int().default(0),
  standardsCreated: z.number().int().default(0),
  tasksCreated: z.number().int().default(0),

  // change detection counts
  changes: z.object({
    obligations: changeDetectionProgressSchema,
    obligationChanges: changeDetectionProgressSchema,
  }),
});

export type RegulatorProgress = Readonly<
  z.infer<typeof regulatorProgressSchema>
>;

export const ingestionRunSchema = z.object({
  id: ingestionRunIdSchema,
  providerName: providerNameSchema,
  orgKey: z.string(),
  tenant: z.string(),
  previousRunId: ingestionRunIdSchema.nullable().default(null),
  regulatorProgress: z.array(regulatorProgressSchema).default([]),
  phase: ingestionPhaseSchema,
  startedAtTimestamp: z.string(),
  completedAtTimestamp: z.nullable(z.string()),
});

export type IngestionRun = Readonly<z.infer<typeof ingestionRunSchema>>;
export type NewIngestionRun = Omit<IngestionRun, 'id'>;

export const createIngestionRun = (
  providerName: ProviderName,
  orgKey: string,
  tenant: string
): NewIngestionRun => ({
  regulatorProgress: [],
  previousRunId: null,
  providerName,
  orgKey,
  tenant,
  completedAtTimestamp: null,
  startedAtTimestamp: new Date().toISOString(),
  phase: {
    type: 'initialised',
    enteredAt: new Date().toISOString(),
  },
});

export const startPrefetching = (ingestionRun: IngestionRun): IngestionRun => ({
  ...ingestionRun,
  phase: {
    type: 'prefetching',
    enteredAt: new Date().toISOString(),
  },
});

export const completePrefetch = (
  ingestionRun: IngestionRun,
  totalTaskCount: number,
  totalObligationChangeCount: number
): IngestionRun => {
  if (ingestionRun.phase.type !== 'prefetching') {
    throw new Error(
      `Cannot complete prefetch from phase: ${ingestionRun.phase.type}`
    );
  }

  return {
    ...ingestionRun,
    phase: {
      type: 'prefetch_complete',
      enteredAt: new Date().toISOString(),
      totalTaskCount,
      totalObligationChangeCount,
    },
  };
};

export const startIngesting = (ingestionRun: IngestionRun): IngestionRun => ({
  ...ingestionRun,
  phase: {
    type: 'ingesting',
    enteredAt: new Date().toISOString(),
    regulatorsInProgress: ingestionRun.regulatorProgress.map(
      (rp) => rp.regulatorId
    ),
  },
});

export const startChangeDetection = (
  ingestionRun: IngestionRun
): IngestionRun => {
  if (ingestionRun.phase.type === 'change_detection') {
    return ingestionRun;
  }

  return {
    ...ingestionRun,
    phase: {
      type: 'change_detection',
      enteredAt: new Date().toISOString(),
    },
  };
};

export const completeChangeDetection = (
  ingestionRun: IngestionRun,
  regulatorId: RegulatorId,
  changes: {
    obligations: z.infer<typeof changeDetectionProgressSchema>;
    obligationChanges: z.infer<typeof changeDetectionProgressSchema>;
  }
): IngestionRun => {
  if (ingestionRun.phase.type !== 'change_detection') {
    throw new Error(
      `Cannot complete change detection from phase: ${ingestionRun.phase.type}`
    );
  }

  const regulatorProgress = ingestionRun.regulatorProgress.find(
    (rp) => rp.regulatorId === regulatorId
  );

  if (!regulatorProgress) {
    throw new Error(`Regulator ${regulatorId} not found in ingestion run`);
  }

  return {
    ...ingestionRun,
    regulatorProgress: ingestionRun.regulatorProgress.map((rp) =>
      rp.regulatorId === regulatorId ? { ...rp, changes } : rp
    ),
  };
};

export const completeIngestionRun = (
  ingestionRun: IngestionRun,
  resultLocation: string | null = null
): IngestionRun => ({
  ...ingestionRun,
  completedAtTimestamp: new Date().toISOString(),
  phase: {
    type: 'completed',
    enteredAt: new Date().toISOString(),
    resultLocation,
  },
});

export const failIngestionRun = (
  ingestionRun: IngestionRun,
  errorMessage: string
): IngestionRun => {
  // Capture which phase it failed at
  const failedAtPhase =
    ingestionRun.phase.type === 'completed' ||
    ingestionRun.phase.type === 'failed'
      ? 'ingesting' // Default if already in terminal state
      : ingestionRun.phase.type;

  return {
    ...ingestionRun,
    completedAtTimestamp: new Date().toISOString(),
    phase: {
      type: 'failed',
      enteredAt: new Date().toISOString(),
      error: errorMessage,
      failedAtPhase,
    },
  };
};

export const addRegulatorToIngestionRun = (
  ingestionRun: IngestionRun,
  regulator: Regulator
): IngestionRun => {
  const existing = ingestionRun.regulatorProgress.find(
    (r) => r.regulatorId === regulator.id
  );
  if (existing) {
    return ingestionRun;
  }

  const newRegulatorProgress: RegulatorProgress = {
    regulatorId: regulator.id,
    regulatorName: regulator.name,
    batchesProcessed: 0,
    recordsProcessed: 0,
    standardsCreated: 0,
    chaptersCreated: 0,
    rulesCreated: 0,
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
  };

  return {
    ...ingestionRun,
    regulatorProgress: [
      ...ingestionRun.regulatorProgress,
      newRegulatorProgress,
    ],
  };
};

export const isPrefetchComplete = (
  ingestionRun: IngestionRun
): ingestionRun is IngestionRun & {
  phase: Extract<IngestionPhase, { type: 'prefetch_complete' }>;
} => {
  return ingestionRun.phase.type === 'prefetch_complete';
};

export const isIngesting = (
  ingestionRun: IngestionRun
): ingestionRun is IngestionRun & {
  phase: Extract<IngestionPhase, { type: 'ingesting' }>;
} => {
  return ingestionRun.phase.type === 'ingesting';
};

export const isFailed = (
  ingestionRun: IngestionRun
): ingestionRun is IngestionRun & {
  phase: Extract<IngestionPhase, { type: 'failed' }>;
} => {
  return ingestionRun.phase.type === 'failed';
};

export const isCompleted = (
  ingestionRun: IngestionRun
): ingestionRun is IngestionRun & {
  phase: Extract<IngestionPhase, { type: 'completed' }>;
} => {
  return ingestionRun.phase.type === 'completed';
};

export const ensureRegulatorExistsOrThrow = (
  ingestionRun: IngestionRun,
  regulatorId: RegulatorId
): Regulator => {
  const regulatorProgress = ingestionRun.regulatorProgress.find(
    (progress) => progress.regulatorId === regulatorId
  );

  if (!regulatorProgress) {
    throw new Error(`Regulator not found in ingestion run`);
  }

  const regulator: Regulator = {
    id: regulatorId,
    name: regulatorProgress.regulatorName,
  };

  return regulator;
};
