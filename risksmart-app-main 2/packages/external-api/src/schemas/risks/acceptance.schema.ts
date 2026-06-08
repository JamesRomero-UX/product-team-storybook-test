import {
  isoDateTimeValue,
  providerIdOrUuid,
  referencedResourceSchema,
} from '../../utils/schemas';
import { baseEntitySchema, listLinksSchema } from '../common/base.schema';
import { z } from '../openapi.zod';

const AcceptanceResponseSchema = baseEntitySchema;

export const AcceptanceListResponseSchema = AcceptanceResponseSchema.extend({
  links: listLinksSchema,
}).strict();

export const AcceptanceItemResponseSchema = AcceptanceResponseSchema.extend({
  dateAcceptedFrom: isoDateTimeValue.openapi({
    description: 'Start of the acceptance period',
  }),
  dateAcceptedTo: isoDateTimeValue.openapi({
    description: 'End of the acceptance period',
  }),
  status: z.string().openapi({
    example: 'Active',
    description: 'Status of the risk acceptance',
  }),
  approvedByUser: providerIdOrUuid
    .nullable()
    .openapi({ description: 'User ID who approved the acceptance' }),
  approvedByUserGroup: providerIdOrUuid
    .nullable()
    .openapi({ description: 'User group ID who approved the acceptance' }),
  requestedByUser: providerIdOrUuid
    .nullable()
    .openapi({ description: 'User ID who requested the acceptance' }),
  requestedByUserGroup: providerIdOrUuid
    .nullable()
    .openapi({ description: 'User group ID who requested the acceptance' }),
  links: listLinksSchema.extend({
    approvedByUser: referencedResourceSchema.nullable(),
    requestedByUser: referencedResourceSchema.nullable(),
  }),
}).strict();

export type AcceptanceListResponse = z.infer<
  typeof AcceptanceListResponseSchema
>;
export type AcceptanceItemResponse = z.infer<
  typeof AcceptanceItemResponseSchema
>;
