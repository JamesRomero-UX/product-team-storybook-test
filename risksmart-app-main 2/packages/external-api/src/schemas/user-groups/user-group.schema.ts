import { isoDateTimeValue } from '../../utils/schemas';
import { z } from '../openapi.zod';

export const UserGroupListResponseSchema = z
  .object({
    id: z.string().uuid().openapi({
      description: 'UUID of the user group',
      example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    }),
    name: z.string().openapi({
      description: 'Name of the user group',
      example: 'Risk Reviewers',
    }),
    description: z.string().nullable().openapi({
      description: 'Description of the user group',
      example: 'Group responsible for reviewing risks',
    }),
    ownerContributor: z.boolean().openapi({
      description: 'Whether the user group is an owner/contributor group',
      example: false,
    }),
    createdAt: isoDateTimeValue.openapi({
      description: 'ISO 8601 timestamp when the user group was created',
      example: '2024-01-01T00:00:00.000Z',
    }),
    updatedAt: isoDateTimeValue.openapi({
      description: 'ISO 8601 timestamp when the user group was last updated',
      example: '2024-06-01T00:00:00.000Z',
    }),
  })
  .strict();

export const UserGroupItemResponseSchema = UserGroupListResponseSchema.extend({
  approvers: z
    .array(
      z.object({
        id: z.string().uuid().openapi({
          description: 'UUID of the approver',
          example: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        }),
      })
    )
    .openapi({
      description: 'List of approvers for the user group',
    }),
}).strict();

export type UserGroupListResponse = z.infer<typeof UserGroupListResponseSchema>;
export type UserGroupItemResponse = z.infer<typeof UserGroupItemResponseSchema>;
