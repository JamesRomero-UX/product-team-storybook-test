import z from 'zod';

export const userIdSchema = z.string().brand('UserId');
export type UserId = z.infer<typeof userIdSchema>;

export const userSchema = z.object({
  id: userIdSchema,
  isCustomerSupport: z.boolean().optional().default(false),
  status: z.enum(['active', 'archived']),
  authConnection: z.string().nullish(),
  roleKey: z.string().nullish(),
});
