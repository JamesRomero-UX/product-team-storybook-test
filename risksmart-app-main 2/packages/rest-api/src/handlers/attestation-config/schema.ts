import { z } from 'zod';

export const AttestationTimeLimitSchema = z.enum([
  '1 day',
  '1 mon',
  '2 mons',
  '3 mons',
  '6 mons',
  '1 year',
  '2 years',
]);

export const PostSchema = z.object({
  object: z.object({
    ParentId: z.string().uuid(),
    RequireGlobalAttestation: z.boolean(),
    AttestationGroupIds: z.array(z.string().uuid()),
    AttestationTimeLimit: AttestationTimeLimitSchema.nullish(),
    AttestationPromptText: z.string().nullish(),
  }),
});
