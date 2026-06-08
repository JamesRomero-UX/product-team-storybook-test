import { z } from 'zod';

/**
 * Shared validation schema for issue update data
 * Used by both the EventBridge handler and HTTP processor
 */
export const issueUpdateValidationSchema = z.object({
  ParentIssueId: z.string().uuid('ParentIssueId must be a valid UUID format'),
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z
    .string()
    .min(1, 'Description is required and must be a non-empty string'),
  CreatedByUser: z
    .string()
    .min(1, 'CreatedByUser is required and must be a non-empty string'),
  ModifiedByUser: z
    .string()
    .min(1, 'ModifiedByUser is required and must be a non-empty string'),
  OrgKey: z
    .string()
    .min(1, 'OrgKey is required and must be a non-empty string'),
});

export type IssueUpdateValidationData = z.infer<
  typeof issueUpdateValidationSchema
>;

/**
 * Schema for validating HTTP request body for creating issue updates
 * CustomAttributeData accepts JSON objects or null
 */
export const createIssueUpdateRequestSchema = z.object({
  ParentIssueId: z.string().uuid('ParentIssueId must be a valid UUID format'),
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z
    .string()
    .min(1, 'Description is required and must be a non-empty string'),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CreateIssueUpdateRequest = z.infer<
  typeof createIssueUpdateRequestSchema
>;
