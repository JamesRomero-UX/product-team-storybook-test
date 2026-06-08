import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const ActionResponseSchema = baseEntitySchema.extend({
  status: z
    .string()
    .min(1)
    .openapi({ example: 'Open', description: 'Current status of the action' }),
});

export const ActionItemResponseSchema = ActionResponseSchema.extend({
  priority: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .openapi({ example: 1, description: 'Priority level (1 = highest)' }),
  links: baseLinksSchema,
}).strict();

export const ActionListResponseSchema = ActionResponseSchema.extend({
  links: listLinksSchema,
}).strict();

export type ActionItemResponse = z.infer<typeof ActionItemResponseSchema>;
export type ActionListResponse = z.infer<typeof ActionListResponseSchema>;
