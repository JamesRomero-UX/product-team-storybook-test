import { z } from 'zod';

/**
 * Schema for validating HTTP request body
 */
export const createObligationImpactRequestSchema = z.object({
  ParentObligationId: z
    .string()
    .uuid('ParentObligationId must be a valid UUID format'),
  Description: z.string().min(1, 'Description is required'),
  ImpactRating: z.number(),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CreateObligationImpactRequest = z.infer<
  typeof createObligationImpactRequestSchema
>;
