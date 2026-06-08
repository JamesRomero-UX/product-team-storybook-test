import { createResourceHref, isoDateTimeValue, providerIdOrUuid } from '../../utils/schemas';
import { z } from '../openapi.zod';

const userListLinksSchema = z.object({
  self: createResourceHref('/api/v1/users/:id').nullable(),
});

// Lightweight list schema — intentionally omits audit fields (roleKey, email, etc) to limit PII exposure in list responses.
export const UserListResponseSchema = z
  .object({
    id: providerIdOrUuid,
    firstName: z
      .string()
      .nullable()
      .openapi({ example: 'Jane', description: 'User first name' }),
    lastName: z
      .string()
      .nullable()
      .openapi({ example: 'Smith', description: 'User last name' }),
    lastSeen: isoDateTimeValue
      .nullable()
      .openapi({ description: 'Last time the user was active' }),
    friendlyName: z.string().min(1).openapi({
      example: 'Jane Smith',
      description: 'Display name for the user',
    }),
    links: userListLinksSchema,
  })
  .strict();

export type UserListResponse = z.infer<typeof UserListResponseSchema>;

export const UserItemResponseSchema = z
  .object({
    id: providerIdOrUuid,
    firstName: z
      .string()
      .nullable()
      .openapi({ example: 'Jane', description: 'User first name' }),
    lastName: z
      .string()
      .nullable()
      .openapi({ example: 'Smith', description: 'User last name' }),
    businessUnitId: z.string().uuid().nullable().openapi({
      example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'UUID of the user business unit',
    }),
    status: z
      .string()
      .nullable()
      .openapi({ example: 'active', description: 'Account status' }),
    jobTitle: z
      .string()
      .nullable()
      .openapi({ example: 'Risk Manager', description: 'User job title' }),
    department: z.string().nullable().openapi({
      example: 'Risk & Compliance',
      description: 'Department the user belongs to',
    }),
    officeLocation: z.string().nullable().openapi({
      example: 'London HQ',
      description: 'Physical office location',
    }),
    lastSeen: isoDateTimeValue
      .nullable()
      .openapi({ description: 'Last time the user was active' }),
    friendlyName: z.string().min(1).openapi({
      example: 'Jane Smith',
      description: 'Display name for the user',
    }),
    links: userListLinksSchema,
  })
  .strict();

export type UserItemResponse = z.infer<typeof UserItemResponseSchema>;
