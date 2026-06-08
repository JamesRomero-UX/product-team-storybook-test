import {
  entityIdValue,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
} from '../../utils/schemas';
import { z } from '../openapi.zod';
import { listLinksSchema } from './base.schema';

export const LinkedItemBaseSchema = z.object({
  id: entityIdValue,
  linkedItemId: entityIdValue.openapi({
    description: 'ID of the linked resource',
  }),
  linkedItemTitle: z.string().nullable().openapi({
    example: 'Related risk',
    description: 'Title of the linked resource',
  }),
  linkedItemType: z
    .string()
    .nullable()
    .openapi({ example: 'risk', description: 'Type of the linked resource' }),
  relationshipType: z
    .string()
    .nullable()
    .openapi({ example: 'related', description: 'Nature of the relationship' }),
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  createdBy: providerIdOrUuid.nullable(),
  updatedBy: providerIdOrUuid.nullable(),
  links: listLinksSchema.extend({
    self: z.null(),
    linkedItem: referencedResourceSchema
      .nullable()
      .openapi({ description: 'Reference to the linked resource' }),
  }),
});

export const LinkedItemListSchema = z.array(LinkedItemBaseSchema.strict());

export type LinkedItemResponse = z.infer<typeof LinkedItemBaseSchema>;
export type LinkedItemListResponse = z.infer<typeof LinkedItemListSchema>;
