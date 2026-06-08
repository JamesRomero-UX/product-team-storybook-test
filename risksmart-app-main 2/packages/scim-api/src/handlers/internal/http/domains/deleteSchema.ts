import { z } from 'zod';

export const deleteSchema = z.object({
  tenant: z.string(),
  domain: z.string(),
});
export type DeleteSchema = z.infer<typeof deleteSchema>;
