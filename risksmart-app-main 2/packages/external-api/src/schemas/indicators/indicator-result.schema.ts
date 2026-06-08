import {
  entityIdValue,
  isoDateTimeValue,
  providerIdOrUuid,
} from '../../utils/schemas';
import { baseLinksSchema, listLinksSchema } from '../common/base.schema';
import { z } from '../openapi.zod';

const IndicatorResultResponseSchema = z.object({
  id: entityIdValue,
  description: z.string().nullable().openapi({
    example: 'Revenue below target this month',
    description: 'Details about this result',
  }),
  resultDate: isoDateTimeValue,
  targetValueText: z.string().nullable().openapi({
    example: 'Red',
    description: 'Result value for text-type indicators',
  }),
  targetValueNumber: z.number().nullable().openapi({
    example: 95.5,
    description: 'Result value for number-type indicators',
  }),
  createdAt: isoDateTimeValue,
  updatedAt: isoDateTimeValue,
  createdBy: providerIdOrUuid,
  updatedBy: providerIdOrUuid,
});

export const IndicatorResultItemResponseSchema =
  IndicatorResultResponseSchema.extend({
    links: baseLinksSchema,
  }).strict();

export const IndicatorResultListResponseSchema =
  IndicatorResultResponseSchema.extend({
    links: listLinksSchema,
  }).strict();

export type IndicatorResultItemResponse = z.infer<
  typeof IndicatorResultItemResponseSchema
>;
export type IndicatorResultListResponse = z.infer<
  typeof IndicatorResultListResponseSchema
>;
