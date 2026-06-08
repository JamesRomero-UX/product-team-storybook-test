import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const ConsequenceBaseSchema = baseEntitySchema.omit({
  sequentialId: true,
  owners: true,
  contributors: true,
  tags: true,
});

const consequenceLinksSchema = baseLinksSchema.omit({
  owners: true,
  contributors: true,
  linkedItems: true,
});

export const ConsequenceListResponseSchema = ConsequenceBaseSchema.extend({
  links: listLinksSchema.omit({
    owners: true,
    contributors: true,
    linkedItems: true,
  }),
}).strict();

export const ConsequenceItemResponseSchema = ConsequenceBaseSchema.extend({
  costType: z.string().nullable().openapi({
    example: 'Financial',
    description: 'Category of cost incurred',
  }),
  costValue: z.number().nullable().openapi({
    example: 50000,
    description: 'Monetary value of the consequence',
  }),
  criticality: z.number().nullable().openapi({
    example: 2,
    description: 'Criticality rating of the consequence',
  }),
  type: z
    .string()
    .nullable()
    .openapi({ example: 'Regulatory', description: 'Type of consequence' }),
  links: consequenceLinksSchema,
}).strict();

export type ConsequenceItemResponse = z.infer<
  typeof ConsequenceItemResponseSchema
>;
export type ConsequenceListResponse = z.infer<
  typeof ConsequenceListResponseSchema
>;
