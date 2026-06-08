import { z } from 'zod';

export const ApproverResponsePutSchema = z.object({
  input: z.object({
    ChangeRequestId: z.string().uuid(),
    Comment: z.string(),
    Response: z.boolean(),
    LevelId: z.string().uuid(),
    OverrideLevel: z.boolean(),
  }),
});
