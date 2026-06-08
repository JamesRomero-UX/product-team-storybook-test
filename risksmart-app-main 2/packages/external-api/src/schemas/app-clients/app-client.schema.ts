import { z } from 'zod';

import { resourceScopes } from '../../auth/scopes';
import { extendSchema } from '../../utils/schemas';

const timestampMs = z
  .number()
  .int()
  .nonnegative()
  .refine((val) => val.toString().length === 13, {
    message: 'Must be a 13-digit millisecond timestamp',
  });
const scopeSchema = z.object({
  name: z.string().min(3),
  desc: z.string().min(3),
});
const rateLimitProfile = z.enum(['chill', 'cruise', 'turbo', 'fullSend']);

export const appClientItemRequestInputSchema = z.object({
  clientId: z.string().min(5, 'ID must be at least 5 characters'),
});

export const appClientRequestSchema = z.object({
  name: z
    .string()
    .min(5, 'Name must be at least 5 characters')
    .max(250, 'Name must not exceed 250 characters')
    .regex(/^[a-zA-Z0-9 .-]+$/, {
      message: "Only letters, numbers, spaces, '.', and '-' are allowed",
    }),
  scopes: z
    .array(
      z
        .string()
        .refine((scope) => resourceScopes.has(scope), 'Invalid scope name')
    )
    .min(1, 'At least 1 scope is required')
    .max(500, 'Maximum 500 scopes allowed'),
});

export const appClientCreateSchema = extendSchema(appClientRequestSchema, {
  createdAt: timestampMs,
  updatedAt: timestampMs,
  createdBy: z.string(),
  updatedBy: z.string(),
  status: z.enum(['active', 'pending', 'removed']),
  compatVersion: z.string().min(3),
  role: z.enum(['rs-internal', 'rs-external']),
  orgId: z.string(),
  tenantId: z.string(),
  rateLimitProfile: rateLimitProfile,
});

export const appClientItemResponse = appClientRequestSchema.extend({
  compatVersion: z.string().min(3),
  createdAt: timestampMs,
  name: z.string().min(5),
  clientKey: z.string().min(5),
  status: z.enum(['active', 'pending']),
  scopes: z.array(z.string().min(5)),
  rateLimitProfile: rateLimitProfile.optional(),
});

export const appClientListResponse = z.object({
  data: z.array(appClientItemResponse),
  metadata: z.object({
    orgMaxClients: z.number().min(1),
    documentationPath: z.string().min(1),
    allowedScopes: z.array(scopeSchema),
  }),
});

export type AppClientItemRequestInput = z.infer<
  typeof appClientItemRequestInputSchema
>;
export type AppClientItemRequestInputSchema =
  typeof appClientItemRequestInputSchema;
export type AppClientCreate = z.infer<typeof appClientCreateSchema>;
export type AppClientRequestSchema = typeof appClientRequestSchema;
export type AppClientRequest = z.infer<typeof appClientRequestSchema>;
export type AppClientListResponse = z.infer<typeof appClientListResponse>;
export type AppClientItemResponse = z.infer<typeof appClientItemResponse>;
