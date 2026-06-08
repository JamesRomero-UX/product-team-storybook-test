import { z } from 'zod';

import { auditFieldSchema } from './common.types';
import { obligationIdSchema } from './obligation';

export const obligationChangeIdSchema = z
  .string()
  .uuid()
  .brand<'ObligationChangeId'>();
export type ObligationChangeId = z.infer<typeof obligationChangeIdSchema>;

export const baseObligationChangeSchema = auditFieldSchema.extend({
  id: obligationChangeIdSchema,
  obligationId: obligationIdSchema,
  externalId: z.string().max(255),
  descriptionBefore: z.string(),
  descriptionAfter: z.string(),
  rationale: z.string().optional().nullable(),
  effectiveDate: z.date().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  contentHash: z.string(),
  orgKey: z.string().min(1),
});

export type ObligationChange = Readonly<
  z.infer<typeof baseObligationChangeSchema>
>;

export const newObligationChangeSchema = baseObligationChangeSchema.partial({
  id: true,
  createdAtTimestamp: true,
  modifiedAtTimestamp: true,
});

export type NewObligationChange = Readonly<
  z.infer<typeof newObligationChangeSchema>
>;
