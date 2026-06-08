import { AssessmentStatus } from '@risksmart-app/domain/src/types/consts/assessment-status';
import { z } from 'zod';

/** Schema for POST /assessments */
export const createAssessmentRequestSchema = z.object({
  OriginatingItemId: z
    .string()
    .uuid('OriginatingItemId must be a valid UUID')
    .nullable()
    .optional(),
  Title: z.string().min(1, 'Title is required'),
  Summary: z
    .string()
    .nullish()
    .transform((val) => val ?? ''),
  ActualCompletionDate: z.string().nullable().optional(),
  NextTestDate: z.string().nullable().optional(),
  StartDate: z.string().nullable().optional(),
  TargetCompletionDate: z.string().nullable().optional(),
  CompletedByUser: z.string().nullable().optional(),
  Status: z.nativeEnum(AssessmentStatus),
  Outcome: z.number().int().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  OwnerUserIds: z.array(z.string()).optional().default([]),
  OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
  ContributorUserIds: z.array(z.string()).optional().default([]),
  ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateAssessmentRequest = z.infer<
  typeof createAssessmentRequestSchema
>;

/** Schema for PUT /assessments/{id} */
export const updateAssessmentRequestSchema = z.object({
  Id: z.string().uuid('Id must be a valid UUID'),
  Title: z.string().min(1, 'Title is required'),
  Summary: z
    .string()
    .nullish()
    .transform((val) => val ?? ''),
  ActualCompletionDate: z.string().nullable().optional(),
  NextTestDate: z.string().nullable().optional(),
  StartDate: z.string().nullable().optional(),
  TargetCompletionDate: z.string().nullable().optional(),
  CompletedByUser: z.string().nullable().optional(),
  Status: z.nativeEnum(AssessmentStatus),
  Outcome: z.number().int().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  OwnerUserIds: z.array(z.string()).optional().default([]),
  OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
  ContributorUserIds: z.array(z.string()).optional().default([]),
  ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
});

export type UpdateAssessmentRequest = z.infer<
  typeof updateAssessmentRequestSchema
>;
