import { z } from 'zod';

export const postSchema = z
  .object({
    expireInMonths: z.enum(['6', '12', '24']).optional(),
  })
  .strict();
export type PostSchema = z.infer<typeof postSchema>;
