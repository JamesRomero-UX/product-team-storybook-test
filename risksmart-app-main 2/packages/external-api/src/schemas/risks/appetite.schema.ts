import {
  ancestorContributorSchema,
  entityIdValue,
  isoDateTimeValue,
  providerIdOrUuid,
} from '../../utils/schemas';
import { baseLinksSchema, listLinksSchema } from '../common/base.schema';
import { z } from '../openapi.zod';

export const AppetiteResponseSchema = z.object({
  id: entityIdValue,
  sequentialId: z
    .number()
    .openapi({ example: 5, description: 'Sequential ID for human reference' }),
  statement: z.string().nullable().openapi({
    example: 'We accept low financial risk',
    description: 'Risk appetite statement',
  }),
  effectiveDate: isoDateTimeValue
    .nullable()
    .openapi({ description: 'Date the appetite becomes effective' }),
  lowerAppetite: z
    .number()
    .nullable()
    .openapi({ example: 0, description: 'Lower boundary of acceptable range' }),
  upperAppetite: z.number().nullable().openapi({
    example: 10,
    description: 'Upper boundary of acceptable range',
  }),
  appetiteType: z.string().nullable().openapi({
    example: 'Quantitative',
    description: 'Type of appetite measurement',
  }),
  impactAppetite: z
    .number()
    .nullable()
    .openapi({ example: 3, description: 'Maximum acceptable impact score' }),
  likelihoodAppetite: z.number().nullable().openapi({
    example: 2,
    description: 'Maximum acceptable likelihood score',
  }),
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  createdBy: providerIdOrUuid.nullable(),
  updatedBy: providerIdOrUuid.nullable(),
});

export const AppetiteListResponseSchema = AppetiteResponseSchema.extend({
  links: listLinksSchema,
});

export const AppetiteItemResponseSchema = AppetiteResponseSchema.extend({
  ancestorContributors: z.array(ancestorContributorSchema),
  links: baseLinksSchema,
});

export type AppetiteResponse = z.infer<typeof AppetiteResponseSchema>;
export type AppetiteListResponse = z.infer<typeof AppetiteListResponseSchema>;
export type AppetiteItemResponse = z.infer<typeof AppetiteItemResponseSchema>;
