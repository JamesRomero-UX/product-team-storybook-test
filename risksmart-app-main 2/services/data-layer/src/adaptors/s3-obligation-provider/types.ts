import z from 'zod';

// see services/rulebook-ingestion/src/domain/types for the sister schema
export const ingestionServiceObligationTypeSchema = z.enum([
  'standard',
  'chapter',
  'rule',
  'task',
]);

export const ingestionServiceObligationSchema = z.object({
  contentHash: z.string(),
  description: z.string().nullish(),
  effectiveDate: z.string().nullish(),
  expiryDate: z.string().nullish(),
  externalId: z.string(),
  externalParentId: z.string().nullish(),
  externalRegulatorId: z.string(),
  provider: z.string(),
  publishedDate: z.string().nullish(),
  referenceCode: z.string().nullish(), // refactor to reference once upstream has also been updated
  regulatorName: z.string(),
  sequence: z.number().int().optional(),
  sourceUrl: z.string().nullish(),
  title: z.string(),
  type: ingestionServiceObligationTypeSchema,
});

export const ingestionServiceObligationChangeSchema = z.object({
  contentHash: z.string(),
  description: z.object({
    before: z.string(),
    after: z.string(),
  }),
  effectiveDate: z.string().optional(),
  externalId: z.string(),
  externalParentId: z.string(),
  rationale: z.string().optional(),
  regulatorId: z.string(),
  sourceUrl: z.string().optional(),
});

// Manifest entry for a single regulator
const manifestRegulatorEntrySchema = z.object({
  id: z.string(),
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

// manifest for the entire ingestion run
export const ingestionManifestSchema = z.object({
  runId: z.string(),
  providerName: z.string(),
  regulators: z.array(manifestRegulatorEntrySchema),
  completedAtTimestamp: z.string(),
});

export type IngestionManifest = z.infer<typeof ingestionManifestSchema>;

// This is the schema for the regulator changes. The content of the file at manifestRegulatorEntrySchema.location
export const regulatorChangeResultSchema = z.object({
  previousRunId: z.string().nullable(),
  providerName: z.string(),
  regulatorId: z.string(),
  obligations: z.object({
    added: z.array(ingestionServiceObligationSchema),
    updated: z.array(ingestionServiceObligationSchema),
    removed: z.array(ingestionServiceObligationSchema),
  }),
  obligationChanges: z.object({
    added: z.array(ingestionServiceObligationChangeSchema),
    updated: z.array(ingestionServiceObligationChangeSchema),
    removed: z.array(ingestionServiceObligationChangeSchema),
  }),
});

export type RegulatorChangeResult = z.infer<typeof regulatorChangeResultSchema>;

export type IngestionServiceObligation = Readonly<
  z.infer<typeof ingestionServiceObligationSchema>
>;

export type IngestionServiceObligationChange = Readonly<
  z.infer<typeof ingestionServiceObligationChangeSchema>
>;
