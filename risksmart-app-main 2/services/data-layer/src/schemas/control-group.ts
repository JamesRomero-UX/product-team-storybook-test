import { z } from 'zod';

export const createControlGroupRequestSchema = z.object({
  Title: z.string().min(1, 'Title is required and must be a non-empty string'),
  Description: z
    .string()
    .min(1, 'Description is required and must be a non-empty string'),
  Owner: z.string().min(1, 'Owner is required and must be a non-empty string'),
  CustomAttributeData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type CreateControlGroupRequest = z.infer<
  typeof createControlGroupRequestSchema
>;
