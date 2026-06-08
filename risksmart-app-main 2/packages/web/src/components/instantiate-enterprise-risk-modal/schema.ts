import { z } from 'zod';

export const schema = z.object({
  Entities: z.array(z.object({ value: z.string() })),
});

export type SchemaFields = z.infer<typeof schema>;
