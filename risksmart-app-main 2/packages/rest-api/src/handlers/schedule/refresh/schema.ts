import { z } from 'zod';

export const RefreshScheduleStateSchema = z.object({
  Ids: z.array(z.string().uuid()).min(1),
});
