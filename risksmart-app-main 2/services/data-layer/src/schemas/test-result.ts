import { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import { z } from 'zod';

export const createControlTestResultRequestSchema = z.object({
  ControlIds: z
    .array(z.string().uuid())
    .min(1, 'At least one ControlId is required'),
  AssessmentId: z.string().uuid().nullable().optional(),
  Description: z.string().nullable().optional(),
  DesignEffectiveness: z.number().int().min(0).max(4).nullable().optional(),
  OverallEffectiveness: z.number().int().min(0).max(4).nullable().optional(),
  PerformanceEffectiveness: z
    .number()
    .int()
    .min(0)
    .max(4)
    .nullable()
    .optional(),
  Submitter: z.string().nullable().optional(),
  TestDate: z.string().nullable().optional(),
  TestType: z.nativeEnum(TestType).nullable().optional(),
  Title: z.string().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CreateControlTestResultRequest = z.infer<
  typeof createControlTestResultRequestSchema
>;

export const updateTestResultRequestSchema = z.object({
  Id: z.string().uuid('Id must be a valid UUID format'),
  ParentControlId: z
    .string()
    .uuid('ParentControlId must be a valid UUID format'),
  Description: z.string().nullable().optional(),
  DesignEffectiveness: z.number().int().min(0).max(4).nullable().optional(),
  OverallEffectiveness: z.number().int().min(0).max(4).nullable().optional(),
  PerformanceEffectiveness: z
    .number()
    .int()
    .min(0)
    .max(4)
    .nullable()
    .optional(),
  Submitter: z.string(),
  TestDate: z.string().nullable().optional(),
  TestType: z.nativeEnum(TestType).nullable().optional(),
  Title: z.string().nullable().optional(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
  OriginalTimestamp: z.string(),
});

export type UpdateTestResultRequest = z.infer<
  typeof updateTestResultRequestSchema
>;

export const deleteTestResultsRequestSchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid test result ID format'))
    .min(1, 'At least one ID is required')
    .max(200, 'Maximum 200 IDs allowed per request'),
});

export type DeleteTestResultsRequest = z.infer<
  typeof deleteTestResultsRequestSchema
>;
