import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const CauseBaseSchema = baseEntitySchema
  .omit({
    sequentialId: true,
    owners: true,
    contributors: true,
    tags: true,
  })
  .extend({
    significance: z
      .number()
      .nullable()
      .openapi({ example: 3, description: 'Significance score of this cause' }),
  });

const causeLinksSchema = baseLinksSchema.omit({
  owners: true,
  contributors: true,
  linkedItems: true,
});

export const CauseListResponseSchema = CauseBaseSchema.extend({
  links: listLinksSchema.omit({
    owners: true,
    contributors: true,
    linkedItems: true,
  }),
}).strict();

export const CauseItemResponseSchema = CauseBaseSchema.extend({
  links: causeLinksSchema,
}).strict();

export type CauseItemResponse = z.infer<typeof CauseItemResponseSchema>;
export type CauseListResponse = z.infer<typeof CauseListResponseSchema>;
