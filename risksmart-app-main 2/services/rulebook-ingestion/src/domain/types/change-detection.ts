import { z } from 'zod';

import { ingestionRunIdSchema } from './ingestion-run';
import { obligationSchema } from './obligation';
import { obligationChangeSchema } from './obligation-change';
import { providerNameSchema } from './provider';
import { regulatorIdSchema } from './regulator';

// Per-regulator change result for S3 export
export const regulatorChangeResultSchema = z.object({
  previousRunId: ingestionRunIdSchema.nullable(),
  regulatorId: regulatorIdSchema,
  providerName: providerNameSchema,
  obligations: z.object({
    added: z.array(obligationSchema),
    updated: z.array(obligationSchema),
    removed: z.array(obligationSchema),
  }),
  obligationChanges: z.object({
    added: z.array(obligationChangeSchema),
    updated: z.array(obligationChangeSchema),
    removed: z.array(obligationChangeSchema),
  }),
});

export type RegulatorChangeResult = z.infer<typeof regulatorChangeResultSchema>;

// Manifest entry for a single regulator
const manifestRegulatorEntrySchema = z.object({
  id: regulatorIdSchema,
  name: z.string(),
  location: z.string(),
  obligations: z.object({
    added: z.number().int(),
    updated: z.number().int(),
    removed: z.number().int(),
  }),
  obligationChanges: z.object({
    added: z.number().int(),
    updated: z.number().int(),
    removed: z.number().int(),
  }),
});

export type ManifestRegulatorEntry = z.infer<
  typeof manifestRegulatorEntrySchema
>;

// Manifest for the entire ingestion run
export const ingestionManifestSchema = z.object({
  runId: ingestionRunIdSchema,
  providerName: providerNameSchema,
  regulators: z.array(manifestRegulatorEntrySchema),
  completedAtTimestamp: z.string(),
});
export type IngestionManifest = z.infer<typeof ingestionManifestSchema>;
