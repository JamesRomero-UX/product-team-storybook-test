import { z } from 'zod';

export const PostSchema = z.object({
  object: z.object({
    ObligationChangeId: z.string().uuid(),
    UserId: z.string(),
  }),
});

export type PostSchemaType = z.infer<typeof PostSchema>;

export const DeleteSchema = z.object({
  object: z.object({
    ObligationChangeId: z.string().uuid(),
    UserId: z.string(),
  }),
});
