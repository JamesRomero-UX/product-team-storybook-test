import { z } from 'zod';

export const postSchema = z.object({
  tenant: z.string(),
  expireInMonths: z.enum(['6', '12', '24']).optional(),
});
export type PostSchema = z.infer<typeof postSchema>;
