import { z } from 'zod';

export const patchSchema = z.object({
  userId: z.string(),
  roleIds: z.array(z.string()),
});
export type PatchSchema = z.infer<typeof patchSchema>;
