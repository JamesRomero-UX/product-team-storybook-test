import { z } from 'zod';

const scimPatchOperation = z.object({
  op: z.enum(['add', 'Add', 'replace', 'Replace', 'remove', 'Remove']),
  path: z.string().optional(),
  value: z
    .union([
      z.string(),
      z.boolean(),
      z.array(z.any()),
      z.record(z.union([z.string(), z.number(), z.boolean()])),
    ])
    .optional(),
});

export const scimPatchRequest = z.object({
  schemas: z.array(z.literal('urn:ietf:params:scim:api:messages:2.0:PatchOp')),
  Operations: z.array(scimPatchOperation),
});

export type PatchSchema = z.infer<typeof scimPatchRequest>;
