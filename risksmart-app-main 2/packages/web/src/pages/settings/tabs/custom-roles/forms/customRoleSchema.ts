import { UserOrGroupsSchema } from 'src/schemas/global';
import { z } from 'zod';

export const CustomRoleSchema = z.object({
  Name: z.string().min(1, { message: 'Please enter a role name' }),
  Description: z
    .string()
    .optional()
    .transform((e) => (e === '' ? undefined : e)),
  RoleKeys: z
    .array(z.string())
    .min(1, { message: 'Please select at least one permission' }),
  UserIds: UserOrGroupsSchema,
});

export type CustomRoleFormFields = z.infer<typeof CustomRoleSchema>;

export const defaultValues: CustomRoleFormFields = {
  Name: '',
  Description: undefined,
  RoleKeys: [],
  UserIds: [],
};
