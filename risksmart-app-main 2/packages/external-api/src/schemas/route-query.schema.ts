import type { ZodType } from 'zod';

import { z } from './openapi.zod';

export const baseQuerySchema = z.object({
  page_size: z.coerce
    .number()
    .int()
    .positive()
    .min(1, { message: 'limit of at least 1 item' })
    .optional()
    .openapi({ example: 25, description: 'Number of items per page' }),
  start_after: z.string().optional().openapi({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Cursor for forward pagination',
  }),
  ending_before: z.string().optional().openapi({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Cursor for backward pagination',
  }),
  expand: z.string().optional().openapi({
    example: 'customFields',
    description: 'Comma-separated list of fields to expand',
  }),
});

export type BaseQuerySchema = typeof baseQuerySchema;

export const queryMetadataResponse = z.object({
  count: z
    .number()
    .int()
    .openapi({ example: 100, description: 'Total number of matching items' }),
  beforeCursor: z.string().nullable().openapi({
    example: 'eyJ2ZXJzaW9uIjoxfQ',
    description: 'Cursor for the previous page',
  }),
  afterCursor: z.string().nullable().openapi({
    example: 'eyJ2ZXJzaW9uIjoxfQ',
    description: 'Cursor for the next page',
  }),
  nextPage: z.string().nullable().openapi({
    example: '/api/v1/risks?start_after=abc',
    description: 'URL for the next page',
  }),
  prevPage: z.string().nullable().openapi({
    example: '/api/v1/risks?ending_before=abc',
    description: 'URL for the previous page',
  }),
  hasMore: z.boolean().openapi({
    example: true,
    description: 'Whether more results are available',
  }),
});

export type QueryMetaDataResponse = z.infer<typeof queryMetadataResponse>;

export const queryCursorSchema = z.object({
  version: z.number().positive().min(1),
  type: z.enum(['after', 'before']),
  cursorId: z.string(),
  idType: z.enum(['sequentialId', 'uuidDateTime']),
});

export type QueryCursor = z.infer<typeof queryCursorSchema>;

export const createBaseListResponse = <T extends ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pageInfo: queryMetadataResponse,
  });

export type BaseQuery = z.infer<typeof baseQuerySchema>;
