import type {
  ListQueryBySeqId,
  ListQueryByUuidTs,
} from '../routers/backend/query.schema';
import type { CompoundPageMeta, PageMeta } from '../types/backend/v1/index';

export const DEFAULT_PAGE_LIMIT = 1000;

interface CursorOpts {
  beforeId: string | number | null;
  afterId: string | number | null;
}

interface CompoundCursorOpts {
  beforeId: string | null;
  beforeDateTime: string | null;
  afterId: string | null;
  afterDateTime: string | null;
}

type Direction = 'desc' | 'asc';

export const uuidDateTimePaginationConfig = (
  opts: ListQueryByUuidTs,
  defaultLimit = DEFAULT_PAGE_LIMIT,
  direction: Direction = 'desc',
  dateTimeField: string = 'CreatedAtTimestamp',
  idField: string = 'Id'
) => {
  const { limit = null } = opts || {};
  const queryLimit = limit
    ? Math.min(Math.max(limit, 1), defaultLimit)
    : defaultLimit;

  const beforeId = opts?.beforeId ?? null;
  const beforeDateTime = opts?.beforeDateTime ?? null;
  const afterId = opts?.afterId ?? null;
  const afterDateTime = opts?.afterDateTime ?? null;

  // comparison operators relative to sort direction
  const fwdOp = direction === 'asc' ? 'gt' : 'lt';
  const bwdOp = direction === 'asc' ? 'lt' : 'gt';
  const fwdDirection = direction;
  const bwdDirection: Direction = direction === 'asc' ? 'desc' : 'asc';

  // mutually exclusive forwards or back paging (no bounded window)
  if (
    beforeId !== null &&
    beforeDateTime !== null &&
    afterId !== null &&
    afterDateTime !== null
  ) {
    throw new Error("Provide only one of 'after' or 'before' for pagination.");
  }

  // page backwards direction, requires an any to solve drizzle type infer
  if (beforeId !== null && beforeDateTime !== null) {
    return {
      queryConfig: {
        where: {
          OR: [
            { [dateTimeField]: { [bwdOp]: beforeDateTime } },
            {
              [dateTimeField]: beforeDateTime,
              [idField]: { [bwdOp]: beforeId },
            },
          ],
        },
        // adds an extra row so we can get the next id if it exists.
        limit: queryLimit + 1,
      },
      limit: queryLimit,
      direction: bwdDirection,
    };
  }

  // page forwards direction
  return {
    queryConfig: {
      ...(afterId !== null && afterDateTime !== null
        ? {
            where: {
              OR: [
                { [dateTimeField]: { [fwdOp]: afterDateTime } },
                {
                  [dateTimeField]: afterDateTime,
                  [idField]: { [fwdOp]: afterId },
                },
              ],
            },
          }
        : {}),
      // adds an extra row so we can get the next id if it exists.
      limit: queryLimit + 1,
    },
    limit: queryLimit,
    direction: fwdDirection,
  };
};

export const sequentialIdPaginationConfig = (
  opts: ListQueryBySeqId,
  defaultLimit = DEFAULT_PAGE_LIMIT,
  direction: Direction = 'desc'
) => {
  const { limit = null } = opts || {};
  const queryLimit = limit
    ? Math.min(Math.max(limit, 1), defaultLimit)
    : defaultLimit;
  const beforeId = opts?.beforeSequentialId ? opts?.beforeSequentialId : null;
  const afterId = opts?.afterSequentialId ? opts?.afterSequentialId : null;

  // comparison operators relative to sort direction
  const fwdOp = direction === 'asc' ? 'gt' : 'lt';
  const bwdOp = direction === 'asc' ? 'lt' : 'gt';
  const fwdDirection = direction;
  const bwdDirection: Direction = direction === 'asc' ? 'desc' : 'asc';

  // mutually exclusive forwards or back paging (no bounded window)
  if (beforeId !== null && afterId !== null) {
    return null;
  }

  // page backwards direction
  if (beforeId !== null) {
    return {
      queryConfig: {
        where: { SequentialId: { [bwdOp]: beforeId } },
        orderBy: { SequentialId: bwdDirection },
        // adds an extra row so we can get the next id if it exists.
        limit: queryLimit + 1,
      },
      limit: queryLimit,
    };
  }

  // page forwards direction
  return {
    queryConfig: {
      ...(afterId
        ? {
            where: { SequentialId: { [fwdOp]: afterId } },
          }
        : {}),
      orderBy: { SequentialId: fwdDirection },
      // adds an extra row so we can get the next id if it exists.
      limit: queryLimit + 1,
    },
    limit: queryLimit,
  };
};

export function computePageAndMeta<T extends Record<string, unknown>>(
  opts: CursorOpts,
  data: T[],
  limit: number,
  cursorKey: keyof T
): { page: T[]; metadata: PageMeta } {
  const isBackward = opts.beforeId !== null;
  const rawLength = data.length;
  // snip the page to remove any next id values,
  // and reverse the  page for correct backwards ordering.
  const page = opts.beforeId
    ? data.slice(0, limit).reverse()
    : data.slice(0, limit);
  const count = page.length;

  const startId = (page.at(0)?.[cursorKey] as string | number) ?? null;
  const endId = (page.at(count - 1)?.[cursorKey] as string | number) ?? null;

  if (isBackward) {
    // there are older rows beyond the first item
    const hasPrev = rawLength > limit;
    // there is something newer than this page.
    const hasNext = count > 0;

    return {
      page,
      metadata: {
        nextId: endId,
        prevId: hasPrev ? startId : null,
        hasNext,
        hasPrev,
        count,
      },
    };
  }

  const hasNext = rawLength > limit;
  const hasPrev = opts.afterId != null;
  let prevId = hasPrev ? startId : null;

  // handle for edge case: empty forward page result.
  if (count === 0) {
    prevId = opts.afterId ?? null;
  }

  return {
    page,
    metadata: {
      nextId: hasNext ? endId : null,
      prevId,
      hasNext,
      hasPrev,
      count,
    },
  };
}

export function computePageAndMetaCompound<T extends Record<string, unknown>>(
  opts: CompoundCursorOpts,
  data: T[],
  limit: number,
  idKey: keyof T,
  dateTimeKey: keyof T
): { page: T[]; metadata: CompoundPageMeta } {
  const isBackward = opts.beforeId !== null && opts.beforeDateTime !== null;
  const rawLength = data.length;

  // snip the page to remove any next id values,
  // and reverse the page for correct backwards ordering.
  const page = isBackward
    ? data.slice(0, limit).reverse()
    : data.slice(0, limit);
  const count = page.length;

  const startId = (page.at(0)?.[idKey] as string) ?? null;
  const startDateTime = (page.at(0)?.[dateTimeKey] as string) ?? null;
  const endId = (page.at(count - 1)?.[idKey] as string) ?? null;
  const endDateTime = (page.at(count - 1)?.[dateTimeKey] as string) ?? null;

  if (isBackward) {
    // there are older rows beyond the first item
    const hasPrev = rawLength > limit;
    // there is something newer than this page.
    const hasNext = count > 0;

    return {
      page,
      metadata: {
        nextId: endId,
        nextDateTime: endDateTime,
        prevId: hasPrev ? startId : null,
        prevDateTime: hasPrev ? startDateTime : null,
        hasNext,
        hasPrev,
        count,
      },
    };
  }

  const hasNext = rawLength > limit;
  const hasPrev = opts.afterId != null && opts.afterDateTime != null;
  let prevId = hasPrev ? startId : null;
  let prevDateTime = hasPrev ? startDateTime : null;

  // handle for edge case: empty forward page result.
  if (count === 0) {
    prevId = opts.afterId ?? null;
    prevDateTime = opts.afterDateTime ?? null;
  }

  return {
    page,
    metadata: {
      nextId: hasNext ? endId : null,
      nextDateTime: hasNext ? endDateTime : null,
      prevId,
      prevDateTime,
      hasNext,
      hasPrev,
      count,
    },
  };
}
