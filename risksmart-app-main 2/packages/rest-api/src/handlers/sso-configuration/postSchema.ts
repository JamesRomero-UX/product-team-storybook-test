import { z } from 'zod';

export const postSchema = z.object({
  object: z.object({
    strategy: z.string(),
    domain: z.string().min(1),
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
    scope: z.string().optional(),
    addOrgConnection: z.boolean(),
    connectionId: z.string().optional(),
    domainAliases: z.array(z.string()).optional(),
  }),
});

export type PostSchema = z.infer<typeof postSchema>;
