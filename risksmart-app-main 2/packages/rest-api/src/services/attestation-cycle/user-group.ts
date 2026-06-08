import z from 'zod';

import { userIdSchema } from './user';

export const userGroupIdSchema = z.string().brand('UserGroupId');
export type UserGroupId = z.infer<typeof userGroupIdSchema>;

export const userGroupSchema = z.object({
  id: userGroupIdSchema,
  name: z.string(),
  users: z.array(userIdSchema),
});

export type UserGroup = Readonly<z.infer<typeof userGroupSchema>>;
