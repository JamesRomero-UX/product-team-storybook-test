import isValidDomain from 'is-valid-domain';
import { z } from 'zod';

export const postSchema = z.object({
  tenant: z.string(),
  domain: z.string().refine((value) => isValidDomain(value), {
    message: 'Invalid domain',
  }),
});
export type PostSchema = z.infer<typeof postSchema>;
