import { z } from 'zod';

export const deleteSchema = z.object({
  object: z.object({
    clientId: z.string().min(1),
  }),
});
