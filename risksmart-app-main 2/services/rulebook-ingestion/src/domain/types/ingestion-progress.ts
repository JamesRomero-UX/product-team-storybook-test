import { z } from 'zod';

import type { IngestionRun } from './ingestion-run';
import { regulatorIdSchema } from './regulator';

const _ingestionProgressDelta = z.object({
  regulatorId: regulatorIdSchema,
  batchesProcessed: z.number().int(),
  recordsProcessed: z.number().int(),
  standardsCreated: z.number().int().optional(),
  chaptersCreated: z.number().int().optional(),
  rulesCreated: z.number().int().optional(),
  tasksCreated: z.number().int().optional(),
});

export type IngestionProgressDelta = z.infer<typeof _ingestionProgressDelta>;

export const applyProgressDelta = (
  ingestionRun: IngestionRun,
  delta: IngestionProgressDelta
): IngestionRun => {
  const updatedProgress = ingestionRun.regulatorProgress.map((rp) => {
    if (rp.regulatorId !== delta.regulatorId) {
      return rp;
    }

    return {
      ...rp,
      recordsProcessed: rp.recordsProcessed + (delta.recordsProcessed ?? 0),
      batchesProcessed: rp.batchesProcessed + (delta.batchesProcessed ?? 0),
      standardsCreated: rp.standardsCreated + (delta.standardsCreated ?? 0),
      chaptersCreated: rp.chaptersCreated + (delta.chaptersCreated ?? 0),
      rulesCreated: rp.rulesCreated + (delta.rulesCreated ?? 0),
      tasksCreated: rp.tasksCreated + (delta.tasksCreated ?? 0),
    };
  });

  return {
    ...ingestionRun,
    regulatorProgress: updatedProgress,
  };
};
