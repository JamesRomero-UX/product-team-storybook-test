import {
  createResourceHref,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
} from '../../utils/schemas';
import { z } from '../openapi.zod';

const tagLinksSchema = z.object({
  self: createResourceHref('/api/v1/tags/:id'),
  createdBy: referencedResourceSchema
    .nullable()
    .openapi({ description: 'Link to the user who created this tag' }),
  updatedBy: referencedResourceSchema.nullable().openapi({
    description: 'Link to the user who last updated this tag',
  }),
});

const tagBaseSchema = z.object({
  id: z.string().uuid().openapi({
    description: 'UUID of the tag',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  }),
  name: z.string().openapi({
    description: 'Name of the tag',
    example: 'Critical',
  }),
  description: z.string().nullable().openapi({
    description: 'Description of the tag',
    example: 'Tags for critical risks',
  }),
  createdAt: isoDateTimeValue.openapi({
    description: 'ISO 8601 creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  }),
  updatedAt: isoDateTimeValue.openapi({
    description: 'ISO 8601 last updated timestamp',
    example: '2024-06-01T00:00:00.000Z',
  }),
  createdBy: providerIdOrUuid.nullable().openapi({
    description: 'ID of the user who created the tag',
    example: 'auth0|abc123',
  }),
  updatedBy: providerIdOrUuid.nullable().openapi({
    description: 'ID of the user who last updated the tag',
    example: 'auth0|abc123',
  }),
});

export const TagListResponseSchema = tagBaseSchema
  .extend({ links: tagLinksSchema })
  .strict();

export const TagItemResponseSchema = tagBaseSchema
  .extend({ links: tagLinksSchema })
  .strict();

export type TagListResponse = z.infer<typeof TagListResponseSchema>;
export type TagItemResponse = z.infer<typeof TagItemResponseSchema>;
