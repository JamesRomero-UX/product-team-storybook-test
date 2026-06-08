import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const PolicyResponseSchema = baseEntitySchema;

export const PolicyListResponseSchema = PolicyResponseSchema.extend({
  links: listLinksSchema,
}).strict();

export const PolicyItemResponseSchema = PolicyResponseSchema.extend({
  type: z.string().nullable().openapi({
    example: 'Data Governance',
    description: 'Policy classification type',
  }),
  links: baseLinksSchema,
}).strict();

export type PolicyItemResponse = z.infer<typeof PolicyItemResponseSchema>;
export type PolicyListResponse = z.infer<typeof PolicyListResponseSchema>;
