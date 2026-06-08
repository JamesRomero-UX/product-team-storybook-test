import { z } from 'zod';

export const DeleteSchema = z.object({
  Ids: z.array(z.string().uuid()),
});
