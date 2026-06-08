import z from 'zod';

import { createContentHash } from '../create-content-hash';
import { regulatorIdSchema } from './regulator';

export const obligationChangeSchema = z.object({
  contentHash: z.string(),
  description: z.object({
    before: z.string(),
    after: z.string(),
  }),
  effectiveDate: z.string().optional(),
  externalId: z.string(),
  externalParentId: z.string(),
  rationale: z.string().optional(),
  regulatorId: regulatorIdSchema,
  sourceUrl: z.string().optional(),
});

export type ObligationChange = z.infer<typeof obligationChangeSchema>;

const newRawExternalObligationChangeInputSchema = z.object({
  externalParentId: z.string(),
  externalId: z.string(),
  type: z.literal('obligation_change'),
  json: z.string(),
});

export const newRawExternalObligationChangeSchema =
  newRawExternalObligationChangeInputSchema.transform((data) => ({
    ...data,
    contentHash: createContentHash(data.json),
  }));

export type NewRawExternalObligationChange = z.infer<
  typeof newRawExternalObligationChangeSchema
>;
