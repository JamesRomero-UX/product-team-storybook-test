import { ancestorContributorSchema } from '../../utils/schemas';
import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

export const ControlResponseSchema = baseEntitySchema;

export const ControlListResponseSchema = ControlResponseSchema.extend({
  links: listLinksSchema,
});

export const ControlItemResponseSchema = ControlResponseSchema.extend({
  type: z
    .string()
    .nullable()
    .openapi({ example: 'Preventive', description: 'Type of control' }),
  ancestorContributors: z.array(ancestorContributorSchema),
  links: baseLinksSchema,
});

export type ControlResponse = z.infer<typeof ControlResponseSchema>;
export type ControlListResponse = z.infer<typeof ControlListResponseSchema>;
export type ControlItemResponse = z.infer<typeof ControlItemResponseSchema>;
