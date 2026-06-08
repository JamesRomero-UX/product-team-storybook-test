import { z } from 'zod';

export const CreateContactSchema = z.object({
  ThirdPartyId: z.string().uuid(),
  Email: z.string().email(),
  Name: z.string().optional(),
  JobTitle: z.string().optional(),
});

export const patchSchema = z.object({
  ContactIds: z.array(z.string().uuid()).min(1),
});
export type PatchSchema = z.infer<typeof patchSchema>;

export const ResendPasswordResetSchema = z.object({
  ContactId: z.string().uuid(),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type ResendPasswordResetInput = z.infer<
  typeof ResendPasswordResetSchema
>;
