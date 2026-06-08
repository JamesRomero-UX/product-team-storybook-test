import z from 'zod';

export const externalObligationChangeSchema = z.object({
  Id: z.string().uuid(),
  ExternalId: z.string().min(1),
});

export type ExternalObligationChange = z.infer<
  typeof externalObligationChangeSchema
>;
