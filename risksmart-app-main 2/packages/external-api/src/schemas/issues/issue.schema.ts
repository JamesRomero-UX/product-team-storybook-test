import { createResourceHref, isoDateTimeValue } from '../../utils/schemas';
import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const issueExamplePathSlug = '/api/v1/issues/:id';

const IssueResponseSchema = baseEntitySchema;

const extendedLinks = {
  actions: createResourceHref(`${issueExamplePathSlug}/actions`),
  updates: createResourceHref(`${issueExamplePathSlug}/updates`),
  causes: createResourceHref(`${issueExamplePathSlug}/causes`),
  consequences: createResourceHref(`${issueExamplePathSlug}/consequences`),
  assessment: createResourceHref(`${issueExamplePathSlug}/assessment`),
};

export const IssueListResponseSchema = IssueResponseSchema.extend({
  links: listLinksSchema.extend(extendedLinks),
}).strict();

export const IssueItemResponseSchema = IssueResponseSchema.extend({
  dateOccurred: isoDateTimeValue.openapi({
    description: 'Date the issue occurred',
  }),
  dateIdentified: isoDateTimeValue.openapi({
    description: 'Date the issue was identified',
  }),
  dateRaised: isoDateTimeValue
    .nullable()
    .openapi({ description: 'Date the issue was formally raised' }),
  type: z.string().nullable().openapi({
    example: 'Operational',
    description: 'Issue classification type',
  }),
  isExternalIssue: z.boolean().nullable().openapi({
    example: false,
    description: 'Whether the issue originated externally',
  }),
  impactsCustomer: z.boolean().nullable().openapi({
    example: false,
    description: 'Whether the issue impacts customers',
  }),
  links: baseLinksSchema.extend(extendedLinks),
}).strict();

export type IssueItemResponse = z.infer<typeof IssueItemResponseSchema>;
export type IssueListResponse = z.infer<typeof IssueListResponseSchema>;
