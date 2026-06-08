import { z } from 'zod';

export const CustomRoleUserPutSchema = z.object({
  Input: z.object({
    CustomRoleIds: z.string().uuid().array(),
    UserId: z.string(),
  }),
});
