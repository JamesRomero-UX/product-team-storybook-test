import {
  createResourceHref,
  entityIdValue,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
  tagSchema,
} from '../../utils/schemas';
import { z } from '../openapi.zod';

// Base entity schema containing common fields shared across all resources.
export const baseEntitySchema = z.object({
  id: entityIdValue,
  sequentialId: z.number().int().nonnegative().nullable().openapi({
    example: 42,
    description: 'Sequential integer ID for human-readable references',
  }),
  title: z.string().min(1).openapi({ example: 'My resource title' }),
  description: z
    .string()
    .min(1)
    .nullable()
    .openapi({ example: 'Detailed description of the resource' }),
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  createdBy: providerIdOrUuid.nullable(),
  updatedBy: providerIdOrUuid.nullable(),
  owners: z
    .array(providerIdOrUuid)
    .openapi({ description: 'List of user IDs who own this resource' }),
  contributors: z.array(providerIdOrUuid).openapi({
    description: 'List of user IDs who contribute to this resource',
  }),
  tags: z
    .array(tagSchema)
    .openapi({ description: 'Tags attached to this resource' }),
});

// Base links schema for item/single resource responses.
export const baseLinksSchema = z.object({
  self: createResourceHref('/api/v1/resources/:id'),
  createdBy: referencedResourceSchema
    .nullable()
    .openapi({ description: 'Link to the user who created this resource' }),
  updatedBy: referencedResourceSchema.nullable().openapi({
    description: 'Link to the user who last updated this resource',
  }),
  owners: z
    .array(referencedResourceSchema)
    .openapi({ description: 'Links to owner user resources' }),
  contributors: z
    .array(referencedResourceSchema)
    .openapi({ description: 'Links to contributor user resources' }),
  linkedItems: createResourceHref('/api/v1/resources/:id/linked-items')
    .nullable()
    .optional()
    .openapi({ description: 'Link to items linked to this resource' }),
});

// Extends base links with parents references.
export const listLinksSchema = baseLinksSchema.extend({
  parents: z
    .array(referencedResourceSchema.nullable())
    .openapi({ description: 'Links to parent resources' }),
});

export const mutateServiceContextSchema = z.object({
  actorId: providerIdOrUuid.optional(),
  orgId: z.string(),
  tenantId: z.string(),
  authToken: z.string(),
});

export type MutateServiceContextSchema = typeof mutateServiceContextSchema;
export type MutateServiceContext = z.infer<typeof mutateServiceContextSchema>;
