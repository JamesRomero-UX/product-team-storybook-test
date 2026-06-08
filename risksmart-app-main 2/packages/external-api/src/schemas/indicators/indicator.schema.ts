import {
  createResourceHref,
  scheduleAndStateSchema,
} from '../../utils/schemas';
import {
  baseEntitySchema,
  baseLinksSchema,
  listLinksSchema,
} from '../common/base.schema';
import { z } from '../openapi.zod';

const IndicatorResponseSchema = baseEntitySchema;
const indicatorPathSlug = '/api/v1/indicators/{indicatorId}';

export const IndicatorListResponseSchema = IndicatorResponseSchema.extend({
  links: listLinksSchema.extend({
    results: createResourceHref(`${indicatorPathSlug}/results`),
  }),
}).strict();

export const IndicatorItemResponseSchema = IndicatorResponseSchema.extend({
  type: z
    .string()
    .openapi({ example: 'Number', description: 'Indicator measurement type' }),
  unit: z
    .string()
    .nullable()
    .openapi({ example: 'USD', description: 'Unit of measurement' }),
  targetValue: z.string().nullable().openapi({
    example: 'Green',
    description: 'Target value for text-type indicators',
  }),
  upperTolerance: z
    .number()
    .nullable()
    .openapi({ example: 150, description: 'Upper tolerance boundary' }),
  lowerTolerance: z
    .number()
    .nullable()
    .openapi({ example: 50, description: 'Lower tolerance boundary' }),
  upperAppetite: z
    .number()
    .nullable()
    .openapi({ example: 120, description: 'Upper appetite boundary' }),
  lowerAppetite: z
    .number()
    .nullable()
    .openapi({ example: 80, description: 'Lower appetite boundary' }),
  links: baseLinksSchema.extend({
    results: createResourceHref(`${indicatorPathSlug}/results`),
  }),
  ...scheduleAndStateSchema,
}).strict();

export type IndicatorItemResponse = z.infer<typeof IndicatorItemResponseSchema>;
export type IndicatorListResponse = z.infer<typeof IndicatorListResponseSchema>;
