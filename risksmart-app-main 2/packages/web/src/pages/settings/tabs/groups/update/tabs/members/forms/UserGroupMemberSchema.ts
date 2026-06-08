import { z } from 'zod';

export const UserGroupMemberSchema = z.object({
  Users: z
    .array(
      z.object({
        value: z.string().min(1, { message: 'Required' }),
      })
    )
    .min(1, { message: 'Please select a user' }),
});

export type UserGroupMemberFormFieldsSchema = z.infer<
  typeof UserGroupMemberSchema
>;

export const defaultValues: UserGroupMemberFormFieldsSchema = {
  Users: [],
};
