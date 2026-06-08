import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';

import { ownersList } from '../../utils/schemas';
import { CustomFieldsInputSchema } from '../common/custom-fields.schema';
import { z } from '../openapi.zod';

const baseActionRequestFields = {
  title: z
    .string()
    .min(1, 'Title is required')
    .openapi({ example: 'New action title' }),
  status: z.nativeEnum(ActionStatus).openapi({
    example: ActionStatus.Open,
    description: 'Status of the action',
  }),
  dateRaised: z
    .string()
    .datetime({ offset: true })
    .openapi({ description: 'When was the action raised' }),
  dateDue: z
    .string()
    .datetime({ offset: true })
    .openapi({ description: 'When is the action due' }),
  description: z.string().nullish().openapi({ example: 'Action details' }),
  priority: z
    .number()
    .int()
    .min(1)
    .max(3)
    .openapi({ example: 1, description: 'Priority of the action (1-3)' }),
  closedDate: z
    .string()
    .datetime({ offset: true })
    .nullish()
    .openapi({ description: 'When was the action closed' }),
  owners: ownersList,
  customFields: CustomFieldsInputSchema,
} as const;

export const createActionRequestSchema = z.object({
  ...baseActionRequestFields,
  parentId: z.string().uuid().nullish().openapi({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'ID of the parent resource (e.g. issue)',
  }),
});

export const updateActionRequestSchema = z.object({
  ...baseActionRequestFields,
});

// Creating nested parent schema where parentId is provided separately from the request body (e.g. path params).
export const createActionForParentRequestSchema = updateActionRequestSchema;
export type CreateActionForParentRequest = UpdateActionRequest;

export type CreateActionRequest = z.infer<typeof createActionRequestSchema>;
export type CreateActionRequestSchema = typeof createActionRequestSchema;

export type UpdateActionRequest = z.infer<typeof updateActionRequestSchema>;
export type UpdateActionRequestSchema = typeof updateActionRequestSchema;
