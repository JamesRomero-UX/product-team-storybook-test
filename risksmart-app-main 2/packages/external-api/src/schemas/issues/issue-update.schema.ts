import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import type { z } from '../openapi.zod';

const IssueUpdateBaseSchema = baseEntitySchema.omit({
  sequentialId: true,
  owners: true,
  contributors: true,
  tags: true,
});

const issueUpdateLinksSchema = baseLinksSchema.omit({
  owners: true,
  contributors: true,
  linkedItems: true,
});

export const IssueUpdateListResponseSchema = IssueUpdateBaseSchema.extend({
  links: listLinksSchema.omit({
    owners: true,
    contributors: true,
    linkedItems: true,
  }),
}).strict();

export const IssueUpdateItemResponseSchema = IssueUpdateBaseSchema.extend({
  links: issueUpdateLinksSchema,
}).strict();

export type IssueUpdateItemResponse = z.infer<
  typeof IssueUpdateItemResponseSchema
>;
export type IssueUpdateListResponse = z.infer<
  typeof IssueUpdateListResponseSchema
>;
