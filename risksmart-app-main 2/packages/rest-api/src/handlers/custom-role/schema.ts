import { z } from 'zod';
const requiredMessage = 'Required';
export const CustomRolePostSchema = z.object({
  Input: z.object({
    Name: z.string().min(1, { message: requiredMessage }),
    Description: z.string().nullish(),
    RoleKeys: z.array(z.string()).min(1, { message: requiredMessage }),
    UserIds: z.array(z.string()),
  }),
});

export const CustomRolePutSchema = z.object({
  Input: z.object({
    Id: z.string().uuid(),
    Name: z.string().min(1, { message: requiredMessage }),
    Description: z.string().nullish(),
    RoleKeys: z.array(z.string()).min(1, { message: requiredMessage }),
    UserIds: z.array(z.string()),
  }),
});
