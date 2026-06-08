import { z } from 'zod';

export const PostSchema = z.object({
  Source: z.string().uuid(),
  Targets: z.array(z.string().uuid()),
});

export const UnlinkPostSchema = z.object({ Ids: z.array(z.string().uuid()) });

export type PostSchemaType = z.infer<typeof PostSchema>;
export type UnlinkPostSchemaType = z.infer<typeof UnlinkPostSchema>;
