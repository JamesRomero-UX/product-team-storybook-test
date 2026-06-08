import { z } from 'zod';

import { createContentHash } from '../create-content-hash';
import { providerNameSchema } from './provider';
import { regulatorIdSchema } from './regulator';

const newRawExternalObligationInputSchema = z.object({
  externalId: z.string(),
  externalParentId: z.string().optional().nullable(),
  regulatorId: regulatorIdSchema,
  type: z.enum(['rule', 'task']),
  json: z.string(),
});

export const newRawExternalObligationSchema =
  newRawExternalObligationInputSchema.transform((data) => ({
    ...data,
    contentHash: createContentHash(data.json),
  }));

export type NewRawExternalObligation = z.infer<
  typeof newRawExternalObligationSchema
>;

export const obligationTypeSchema = z.enum([
  'standard',
  'chapter',
  'rule',
  'task',
]);
export type ObligationType = z.infer<typeof obligationTypeSchema>;

export const obligationSchema = z.object({
  contentHash: z.string(),
  description: z.string().optional(),
  effectiveDate: z.string().optional(),
  expiryDate: z.string().optional(),
  externalId: z.string(),
  externalParentId: z.string().optional().nullable(),
  externalRegulatorId: z.string(),
  provider: providerNameSchema,
  publishedDate: z.string().optional(),
  referenceCode: z.string().optional(),
  regulatorName: z.string(),
  sequence: z.number().int().optional(),
  sourceUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
  title: z.string(),
  type: obligationTypeSchema,
});

export type Obligation = Readonly<z.infer<typeof obligationSchema>>;
export type UnlinkedObligation = Omit<Obligation, 'externalParentId'>;
