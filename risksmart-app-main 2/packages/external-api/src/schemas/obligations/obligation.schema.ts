import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const ObligationResponseSchema = baseEntitySchema;

export const ObligationListResponseSchema = ObligationResponseSchema.extend({
  links: listLinksSchema,
}).strict();

export const ObligationItemResponseSchema = ObligationResponseSchema.extend({
  type: z.string().min(1).openapi({
    example: 'Regulatory',
    description: 'Classification of the obligation',
  }),
  interpretation: z.string().nullable().openapi({
    example: 'Must encrypt all PII at rest',
    description: 'Interpretation of the obligation',
  }),
  adherence: z
    .string()
    .min(1)
    .openapi({ example: 'Compliant', description: 'Current adherence status' }),
  links: baseLinksSchema,
}).strict();

export type ObligationItemResponse = z.infer<
  typeof ObligationItemResponseSchema
>;
export type ObligationListResponse = z.infer<
  typeof ObligationListResponseSchema
>;
