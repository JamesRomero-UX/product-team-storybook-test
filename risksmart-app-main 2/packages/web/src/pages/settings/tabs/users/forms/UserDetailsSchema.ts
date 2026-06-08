import { z } from 'zod';

export const UserDetailsSchema = z.object({
  UserId: z.string(),
  Role: z.string().min(1, { message: 'Please select a role' }),
});

// Schema for multi-role mode - expects array of option objects from multiselect
export const UserDetailsSchemaMultiRole = z.object({
  UserId: z.string(),
  Roles: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
      description: z.string().optional(),
    })
  ),
});

export type UserDetailsFormFields = z.infer<typeof UserDetailsSchema>;
export type UserDetailsFormFieldsMultiRole = z.infer<
  typeof UserDetailsSchemaMultiRole
>;
