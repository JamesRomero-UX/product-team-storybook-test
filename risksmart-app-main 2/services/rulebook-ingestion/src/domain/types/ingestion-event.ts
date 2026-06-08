import { z } from 'zod';

export const ingestionEventSchema = z.object({
  orgKey: z.string().min(1),
  tenant: z.string().min(1),
});

export type IngestionEvent = z.infer<typeof ingestionEventSchema>;
