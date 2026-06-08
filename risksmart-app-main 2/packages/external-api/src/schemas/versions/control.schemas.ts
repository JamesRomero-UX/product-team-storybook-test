import {
  entityIdValue,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
  tagSchema,
} from '../../utils/schemas';
import { z } from '../openapi.zod';
import {
  ControlItemResponseSchema,
  ControlListResponseSchema,
} from '../risks/control.schema';

// Added the below API versions to check that the process works ok
// & to give a template for how to implement backwards compatible changes.
export const ControlItemTransform_to_v2025_10_10 =
  ControlItemResponseSchema.transform((data) => {
    const { updatedBy, links, ...rest } = data;
    const { updatedBy: linksUpdatedBy, ...restLinks } = links;

    return {
      ...rest,
      modifiedBy: updatedBy,
      links: {
        ...restLinks,
        modifiedBy: linksUpdatedBy,
      },
    };
  });

// Output schema for version 2025-10-10 (for OpenAPI generation)
export const ControlItemResponseSchema_v2025_10_10 = z.object({
  id: entityIdValue,
  sequentialId: z.number().int().nonnegative().nullable(),
  title: z.string().min(1),
  description: z.string().min(1).nullable(),
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  createdBy: providerIdOrUuid.nullable(),
  modifiedBy: providerIdOrUuid.nullable(), // Changed from updatedBy
  owners: z.array(providerIdOrUuid),
  contributors: z.array(providerIdOrUuid),
  tags: z.array(tagSchema),
  type: z.string().nullable(),
  ancestorContributors: z.array(
    z.object({
      id: entityIdValue.nullable(),
      objectType: z.string().nullable(),
      contributorType: z.string().nullable(),
      ancestorId: entityIdValue.nullable(),
      userGroupId: z.string().nullable(),
      user: referencedResourceSchema.nullable(),
    })
  ),
  links: z.object({
    self: z.object({ href: z.string() }),
    createdBy: referencedResourceSchema.nullable(),
    modifiedBy: referencedResourceSchema.nullable(), // Changed from updatedBy
    owners: z.array(referencedResourceSchema),
    contributors: z.array(referencedResourceSchema),
  }),
});

// transforms updatedBy to modified by.
export const ControlListTransform_to_v2025_10_10 =
  ControlListResponseSchema.transform((data) => {
    const { updatedBy, links, ...rest } = data;
    const { updatedBy: linksUpdatedBy, ...restLinks } = links;

    return {
      ...rest,
      modifiedBy: updatedBy,
      links: {
        ...restLinks,
        modifiedBy: linksUpdatedBy,
      },
    };
  });

/**
 * Output schema for version 2025-10-10 list response
 */
export const ControlListResponseSchema_v2025_10_10 = z.object({
  id: entityIdValue,
  sequentialId: z.number().int().nonnegative().nullable(),
  title: z.string().min(1),
  description: z.string().min(1).nullable(),
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  createdBy: providerIdOrUuid.nullable(),
  modifiedBy: providerIdOrUuid.nullable(), // Changed from updatedBy
  owners: z.array(providerIdOrUuid),
  contributors: z.array(providerIdOrUuid),
  tags: z.array(tagSchema),
  links: z.object({
    self: z.object({ href: z.string() }),
    parents: z.array(referencedResourceSchema.nullable()),
    createdBy: referencedResourceSchema.nullable(),
    modifiedBy: referencedResourceSchema.nullable(), // Changed from updatedBy
    owners: z.array(referencedResourceSchema),
    contributors: z.array(referencedResourceSchema),
  }),
});

// Removes ancestorContributors field for backwards compatibility.
export const ControlItemTransform_to_v2025_09_01 =
  ControlItemResponseSchema_v2025_10_10.transform((data) => {
    const { ancestorContributors: _, ...rest } = data;

    return rest;
  });

// Output schema for version 2025-09-01 (for OpenAPI generation)
export const ControlItemResponseSchema_v2025_09_01 = z.object({
  id: entityIdValue,
  sequentialId: z.number().int().nonnegative().nullable(),
  title: z.string().min(1),
  description: z.string().min(1).nullable(),
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  createdBy: providerIdOrUuid.nullable(),
  modifiedBy: providerIdOrUuid.nullable(),
  owners: z.array(providerIdOrUuid),
  contributors: z.array(providerIdOrUuid),
  tags: z.array(tagSchema),
  type: z.string().nullable(),
  // ancestorContributors removed
  links: z.object({
    self: z.object({ href: z.string() }),
    createdBy: referencedResourceSchema.nullable(),
    modifiedBy: referencedResourceSchema.nullable(),
    owners: z.array(referencedResourceSchema),
    contributors: z.array(referencedResourceSchema),
  }),
});

// List responses don't have ancestorContributors, so no transform needed
export const ControlListResponseSchema_v2025_09_01 =
  ControlListResponseSchema_v2025_10_10;

export type ControlItemResponse_v2025_10_10 = z.infer<
  typeof ControlItemResponseSchema_v2025_10_10
>;
export type ControlItemResponse_v2025_09_01 = z.infer<
  typeof ControlItemResponseSchema_v2025_09_01
>;
export type ControlListResponse_v2025_10_10 = z.infer<
  typeof ControlListResponseSchema_v2025_10_10
>;
export type ControlListResponse_v2025_09_01 = z.infer<
  typeof ControlListResponseSchema_v2025_09_01
>;
