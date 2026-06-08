import {
  createResourceHref,
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
} from '../../utils/schemas';
import { z } from '../openapi.zod';

const departmentLinksSchema = z.object({
  self: createResourceHref('/api/v1/departments/:id'),
  createdBy: referencedResourceSchema
    .nullable()
    .openapi({ description: 'Link to the user who created this department' }),
  updatedBy: referencedResourceSchema.nullable().openapi({
    description: 'Link to the user who last updated this department',
  }),
});

const departmentBaseSchema = z.object({
  id: z.string().uuid().openapi({
    description: 'UUID of the department',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  }),
  name: z.string().openapi({
    description: 'Name of the department',
    example: 'Finance',
  }),
  description: z.string().nullable().openapi({
    description: 'Description of the department',
    example: 'Finance department',
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
    description: 'ID of the user who created the department',
    example: 'auth0|abc123',
  }),
  updatedBy: providerIdOrUuid.nullable().openapi({
    description: 'ID of the user who last updated the department',
    example: 'auth0|abc123',
  }),
});

const departmentGroupId = z.string().uuid().nullable().openapi({
  description: 'UUID of the department group',
  example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
});

export const DepartmentListResponseSchema = departmentBaseSchema
  .extend({ links: departmentLinksSchema })
  .strict();

export const DepartmentItemResponseSchema = departmentBaseSchema
  .extend({
    departmentGroupId: departmentGroupId,
    links: departmentLinksSchema.extend({
      departmentGroup: referencedResourceSchema.nullable().openapi({
        description:
          'Link to the department group this department is a part of',
      }),
    }),
  })
  .strict();

export type DepartmentListResponse = z.infer<
  typeof DepartmentListResponseSchema
>;
export type DepartmentItemResponse = z.infer<
  typeof DepartmentItemResponseSchema
>;
