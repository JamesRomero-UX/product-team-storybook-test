import { ParentIssueTypes } from '@risksmart-app/domain/src/types/consts/parent-issue-type';
import { z } from 'zod';

/**
 * Schema for POST /issues
 * Validates the request body for creating a new issue
 */
export const createIssueRequestSchema = z.object({
  ParentId: z
    .string()
    .uuid('ParentId must be a valid UUID format')
    .nullable()
    .optional(),
  Title: z.string().min(1, 'Title is required'),
  Details: z.string().nullable().optional(),
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ImpactsCustomer: z.boolean().nullable().optional(),
  IsExternalIssue: z.boolean().nullable().optional(),
  DateOccurred: z.string().min(1, 'DateOccurred is required'),
  DateIdentified: z.string().min(1, 'DateIdentified is required'),
  Type: z.nativeEnum(ParentIssueTypes),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  Meta: z.record(z.string(), z.unknown()).nullable().optional(),
  OwnerUserIds: z.array(z.string()).optional().default([]),
  OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
  ContributorUserIds: z.array(z.string()).optional().default([]),
  ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateIssueRequest = z.infer<typeof createIssueRequestSchema>;
