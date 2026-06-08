import { z } from 'zod';

export const UserGroupSchema = z.object({
  Name: z.string().min(1, { message: 'Please enter a user group name' }),
  Description: z
    .string()
    .optional()
    .transform((e) => (e === '' ? undefined : e)),
  Email: z
    .union([
      z.string().email({ message: 'Invalid email address' }),
      z.string().length(0),
    ])
    .optional()
    .transform((e) => (e === '' ? undefined : e)),
  OwnerContributor: z.boolean().optional(),
});

export type UserGroupFormFieldsSchema = z.infer<typeof UserGroupSchema>;

export const defaultValues: UserGroupFormFieldsSchema = {
  Name: '',
  OwnerContributor: true,
};
