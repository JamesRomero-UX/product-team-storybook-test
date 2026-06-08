import createHttpError from 'http-errors';
import { z } from 'zod';

import {
  baseQuerySchema,
  queryCursorSchema,
} from '../schemas/route-query.schema';
import { ub64url } from '../utils/buffer';
import { createMiddleware } from '../utils/createMiddleware';
import { logger } from '../utils/logger';

interface ListRequestQueryProps<
  Filter extends string,
  Include extends string,
  Sort extends string,
> {
  allowedFilters?: readonly Filter[];
  allowedIncludes?: readonly Include[];
  allowedSort?: readonly Sort[];
  maxPageSize?: number;
}

const MAX_PAGE_SIZE = 250;

export function createListRequestQueryMiddleware<
  F extends string = string,
  I extends string = string,
  S extends string = string,
>(props: ListRequestQueryProps<F, I, S> = {}) {
  const { maxPageSize = MAX_PAGE_SIZE } = props;

  const querySchema = baseQuerySchema
    .transform((val) => {
      if (maxPageSize && (val?.page_size ?? 0) > maxPageSize) {
        return { ...val, page_size: maxPageSize };
      }

      return val;
    })
    .superRefine((val, ctx) => {
      const after = val?.start_after;
      const before = val?.ending_before;
      // Only disallow the case where BOTH cursors are provided (no bounded windows).
      if (after && before) {
        const msg = 'Do not provide both "startAfter" and "endBefore".';
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: msg,
          path: ['start_after'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: msg,
          path: ['ending_before'],
        });
      }
    });

  const cursorSchema = z.array(queryCursorSchema.nullable());

  return createMiddleware((req, res, next) => {
    const { success, data, error } = querySchema.safeParse(req.query);
    if (!success) {
      logger.warn({ error }, 'request query failed validation');

      return next(createHttpError(400, 'Invalid query parameters'));
    }

    // parse cursors if provided.
    try {
      const { success, data: cursorData } = cursorSchema.safeParse(
        [data.ending_before, data.start_after].map((cursor) =>
          cursor ? (JSON.parse(ub64url(cursor)) as unknown) : null
        )
      );
      if (!success) {
        return next(createHttpError(400, 'Invalid query cursors'));
      }
      const [beforeCursor = null, afterCursor = null] = cursorData;
      if (beforeCursor && beforeCursor.type !== 'before') {
        return next(
          createHttpError(
            400,
            'Invalid query endingBefore value, did you use a startAfter cursor by mistake?'
          )
        );
      }
      if (afterCursor && afterCursor.type !== 'after') {
        return next(
          createHttpError(
            400,
            'Invalid query startAfter value, did you use a endingBefore cursor by mistake?'
          )
        );
      }
      req.listQueryOptions = {
        beforeCursor,
        afterCursor,
        pageSize: data.page_size ?? maxPageSize,
      };
    } catch (error) {
      logger.warn({ error }, 'failed to parse page cursors');

      return next(createHttpError(400, 'Invalid query cursors'));
    }

    return next();
  });
}
