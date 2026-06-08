import { ownersList } from '../../utils/schemas';
import { CustomFieldsInputSchema } from '../common/custom-fields.schema';
import { z } from '../openapi.zod';

const baseIssueRequestFields = {
  title: z
    .string()
    .min(1, 'Title is required')
    .openapi({ example: 'New issue title' }),
  description: z.string().nullish().openapi({ example: 'Issue details' }),
  dateIdentified: z
    .string()
    .datetime({ offset: true })
    .openapi({ description: 'When was the issue identified' }),
  dateOccurred: z
    .string()
    .datetime({ offset: true })
    .openapi({ description: 'When did the issue occur' }),
  impactsCustomer: z.boolean().nullish().openapi({
    example: true,
    description: 'Does the issue impact the customer',
  }),
  isExternalIssue: z.boolean().nullish().openapi({
    example: true,
    description: 'Is the issue external to the Organisation',
  }),
  owners: ownersList,
  customFields: CustomFieldsInputSchema,
} as const;

export const createIssueRequestSchema = z.object({
  ...baseIssueRequestFields,
});

export const updateIssueRequestSchema = z.object({
  ...baseIssueRequestFields,
});

export type CreateIssueRequest = z.infer<typeof createIssueRequestSchema>;
export type CreateIssueRequestSchema = typeof createIssueRequestSchema;

export type UpdateIssueRequest = z.infer<typeof updateIssueRequestSchema>;
export type UpdateIssueRequestSchema = typeof updateIssueRequestSchema;
