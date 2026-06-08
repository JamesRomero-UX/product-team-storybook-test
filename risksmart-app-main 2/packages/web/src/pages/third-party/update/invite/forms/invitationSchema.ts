import { z } from 'zod';

export const invitationSchema = z.object({
  users: z
    .object({ value: z.string().email(), label: z.string() })
    .array()
    .min(1, 'Required'),
  message: z.string().optional(),
  questionnaires: z.string().uuid().array().min(1, 'Required'),
});

export type InvitationFields = z.infer<typeof invitationSchema>;

export const defaultValues: InvitationFields = {
  users: [],
  message: '',
  questionnaires: [],
};
