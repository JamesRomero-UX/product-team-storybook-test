import { z } from 'zod';

export const postSchema = z.object({
  domain: z.string().min(1),
});
export type PostSchema = z.infer<typeof postSchema>;
