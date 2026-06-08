import type { Request } from 'express';

import type {
  QueryCursor,
  QueryMetaDataResponse,
} from '../../schemas/route-query.schema';
import { b64url } from '../../utils/buffer';
import { buildUrlSearchParams } from '../../utils/transforms';

interface MetaDataInput {
  pageSize?: number;
  count: number;
  prevId: number | string | null;
  nextId: number | string | null;
  nextDateTime?: string;
  prevDateTime?: string;
  hasNext: boolean;
  hasPrev: boolean;
}

const CURRENT_CURSOR_VERSION = 1;
export const COMPOUND_CURSOR_DELIMITER = '#:#';

const encodeCursor = (payload: QueryCursor): string => {
  const json = JSON.stringify(payload);

  return b64url(json);
};

export const transformPageInfoData = (
  metadata: MetaDataInput,
  options: { isForward: boolean; req: Request }
): QueryMetaDataResponse => {
  const {
    count,
    prevId,
    nextId,
    hasNext,
    hasPrev,
    pageSize,
    nextDateTime,
    prevDateTime,
  } = metadata;
  const { req, isForward } = options;
  const beforeCursor = prevId
    ? encodeCursor({
        cursorId: `${prevId}${prevDateTime ? `${COMPOUND_CURSOR_DELIMITER}${prevDateTime}` : ''}`,
        type: 'before',
        version: CURRENT_CURSOR_VERSION,
        idType: prevDateTime ? 'uuidDateTime' : 'sequentialId',
      })
    : null;
  const afterCursor = nextId
    ? encodeCursor({
        cursorId: `${nextId}${nextDateTime ? `${COMPOUND_CURSOR_DELIMITER}${nextDateTime}` : ''}`,
        type: 'after',
        version: CURRENT_CURSOR_VERSION,
        idType: nextDateTime ? 'uuidDateTime' : 'sequentialId',
      })
    : null;
  let hasMore = false;
  if (hasNext && isForward) {
    hasMore = true;
  }
  if (hasPrev && !isForward) {
    hasMore = true;
  }

  return {
    count,
    beforeCursor,
    afterCursor,
    prevPage:
      beforeCursor && pageSize
        ? buildUrlSearchParams(req, {
            page_size: pageSize,
            ending_before: beforeCursor,
            start_after: null,
          })
        : null,
    nextPage:
      afterCursor && pageSize
        ? buildUrlSearchParams(req, {
            page_size: pageSize,
            start_after: afterCursor,
            ending_before: null,
          })
        : null,
    hasMore,
  };
};

export type TransformPageInfoData = typeof transformPageInfoData;
