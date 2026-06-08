import {
  createResourceHref,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
} from '../../utils/schemas';
import { z } from '../openapi.zod';

const departmentGroupLinksSchema = z.object({
  self: createResourceHref('/api/v1/department-groups/:id'),
  createdBy: referencedResourceSchema
    .nullable()
    .openapi({ description: 'Link to the user who created this department group' }),
  updatedBy: referencedResourceSchema.nullable().openapi({
    description: 'Link to the user who last updated this department group',
  }),
});

const departmentGroupBaseSchema = z.object({
  id: z.string().uuid().openapi({
    description: 'UUID of the department group',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  }),
  name: z.string().openapi({
    description: 'Name of the department group',
    example: 'Finance Group',
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
    description: 'ID of the user who created the department group',
    example: 'auth0|abc123',
  }),
  updatedBy: providerIdOrUuid.nullable().openapi({
    description: 'ID of the user who last updated the department group',
    example: 'auth0|abc123',
  }),
});

export const DepartmentGroupListResponseSchema = departmentGroupBaseSchema
  .extend({ links: departmentGroupLinksSchema })
  .strict();

export const DepartmentGroupItemResponseSchema = departmentGroupBaseSchema
  .extend({ links: departmentGroupLinksSchema })
  .strict();

export type DepartmentGroupListResponse = z.infer<
  typeof DepartmentGroupListResponseSchema
>;
export type DepartmentGroupItemResponse = z.infer<
  typeof DepartmentGroupItemResponseSchema
>;
