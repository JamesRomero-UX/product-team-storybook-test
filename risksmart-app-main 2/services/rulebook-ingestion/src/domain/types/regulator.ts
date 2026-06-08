import { z } from 'zod';

export const regulatorIdSchema = z.string().brand<'RegulatorId'>();
export type RegulatorId = z.infer<typeof regulatorIdSchema>;

export const regulatorSchema = z.object({
  id: regulatorIdSchema,
  name: z.string(),
});

export type Regulator = Readonly<z.infer<typeof regulatorSchema>>;
