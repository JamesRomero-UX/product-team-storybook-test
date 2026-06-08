import { z } from 'zod';

export const deleteSchema = z.object({
  domain: z.string().min(1),
});
export type DeleteSchema = z.infer<typeof deleteSchema>;
