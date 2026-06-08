import z from 'zod';

export const AddContactSchema = z.object({
  Email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  Name: z.string().optional(),
  JobTitle: z.string().optional(),
});

export type AddContactSchemaFields = z.infer<typeof AddContactSchema>;

export const addContactDefaultValues: AddContactSchemaFields = {
  Email: '',
  Name: '',
  JobTitle: '',
};
