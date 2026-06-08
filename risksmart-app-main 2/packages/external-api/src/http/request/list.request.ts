import type { HttpError } from 'http-errors';
import createHttpError from 'http-errors';

import type { QueryMetaDataResponse } from '../../schemas/route-query.schema';
import type { AuthenticatedRequest } from '../../types/request';
import type {
  LinkedListIdDateTimeQueryFetchFn,
  LinkedListQueryFetchFn,
  ListDateTimeQueryFetchFn,
  ListQueryFetchFn,
  SeqIdQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import type { ListDataTransformFn } from '../../types/transform';
import { toPositiveIntOrNull } from '../../utils/number';
import type { ProcessListResponses } from '../response/list.response';

export interface QueryListRequestConfig {
  basePath: string;
  defaultPageLimit: number;
  cursorDelimiter: string;
}
interface QueryListRequestsProps {
  processListResponses: ProcessListResponses;
  config: QueryListRequestConfig;
}

const validateLinkId = (req: AuthenticatedRequest) => {
  const linkId = req.params.id;
  if (!linkId) {
    req.requestLogger.warn(
      {
        event: 'invalid_resource_id',
        id: req.params.id,
        path: req.path,
      },
      'Invalid resource id from path params'
    );

    return null;
  }

  return linkId;
};

export const queryListRequests = ({
  config,
  processListResponses,
}: QueryListRequestsProps) => {
  const buildCtx = (req: AuthenticatedRequest): ServiceCallContext => ({
    authToken: req.headers?.authorization ?? '',
  });

  const parseUuidDateTimeCursors = (
    beforeCursor: { idType: string; cursorId: string } | null | undefined,
    afterCursor: { idType: string; cursorId: string } | null | undefined
  ) => {
    const cursorIdType = beforeCursor?.idType ?? afterCursor?.idType;
    if (cursorIdType && cursorIdType !== 'uuidDateTime') {
      return null;
    }
    const [beforeId = null, beforeDateTime = null] =
      beforeCursor?.cursorId.split(config.cursorDelimiter) ?? [];
    const [afterId = null, afterDateTime = null] =
      afterCursor?.cursorId.split(config.cursorDelimiter) ?? [];

    return { beforeId, beforeDateTime, afterId, afterDateTime };
  };

  // queries data fetch func with req input and
  // passes result to response processing.
  const listQueryFetch = async <TIn, TOut>(
    dataFetchFn: ListQueryFetchFn<TIn>,
    dataTransformFn: ListDataTransformFn<TIn, TOut>,
    req: AuthenticatedRequest,
    basePath = config.basePath
  ): Promise<{ data: TOut; pageInfo: QueryMetaDataResponse }> => {
    const { beforeCursor, afterCursor, pageSize } = req.listQueryOptions ?? {};

    const queryConditions: SeqIdQueryOpts = {
      limit: pageSize ?? config.defaultPageLimit,
      beforeId: toPositiveIntOrNull(beforeCursor?.cursorId ?? ''),
      afterId: toPositiveIntOrNull(afterCursor?.cursorId ?? ''),
    };

    const ctx: ServiceCallContext = {
      authToken: req.headers?.authorization ?? '',
    };

    const result = await dataFetchFn(queryConditions, ctx);

    return processListResponses.processListResponse({
      result,
      dataTransformFn,
      req,
      pageSize,
      hasBeforeCursor: !!beforeCursor,
      basePath,
    });
  };

  // queries data fetch func by sequential pagination, resource id, and nested id
  // passes the result to response processing.
  const linkedListQueryFetch = async <TIn, TOut>(
    dataFetchFn: LinkedListQueryFetchFn<TIn>,
    dataTransformFn: ListDataTransformFn<TIn, TOut>,
    req: AuthenticatedRequest,
    basePath = config.basePath
  ): Promise<
    { data: TOut; pageInfo: QueryMetaDataResponse } | HttpError | null
  > => {
    const { beforeCursor, afterCursor, pageSize } = req.listQueryOptions ?? {};
    const ctx: ServiceCallContext = {
      authToken: req.headers?.authorization ?? '',
    };

    const linkId = validateLinkId(req);
    if (!linkId) {
      throw createHttpError(400, 'Invalid nested resource ID provided.');
    }
    const cursorIdType = beforeCursor?.idType ?? afterCursor?.idType;
    if (cursorIdType && cursorIdType !== 'sequentialId') {
      throw createHttpError(400, 'Incorrect cursor provided in query');
    }

    const limit = pageSize ?? config.defaultPageLimit;
    const result = await dataFetchFn(
      linkId,
      {
        limit,
        beforeId: toPositiveIntOrNull(beforeCursor?.cursorId ?? ''),
        afterId: toPositiveIntOrNull(afterCursor?.cursorId ?? ''),
      },
      ctx
    );

    if (result === null) {
      return result;
    }

    return processListResponses.processListResponse({
      result,
      dataTransformFn,
      req,
      pageSize,
      hasBeforeCursor: !!beforeCursor,
      basePath,
      linkId,
    });
  };

  // queries data fetch func by dateTime & UUid pagination, resource id, and nested id
  // passes the result to response processing.
  const linkedListQueryFetchByIdDateTime = async <TIn, TOut>(
    dataFetchFn: LinkedListIdDateTimeQueryFetchFn<TIn>,
    dataTransformFn: ListDataTransformFn<TIn, TOut>,
    req: AuthenticatedRequest,
    basePath = config.basePath
  ): Promise<{ data: TOut; pageInfo: QueryMetaDataResponse } | null> => {
    const linkId = validateLinkId(req);

    if (!linkId) {
      throw createHttpError(400, 'Invalid nested resource ID provided.');
    }

    const { beforeCursor, afterCursor, pageSize } = req.listQueryOptions ?? {};
    const ctx = buildCtx(req);

    const cursors = parseUuidDateTimeCursors(beforeCursor, afterCursor);
    if (cursors === null) {
      throw createHttpError(400, 'Incorrect cursor provided in query');
    }

    const { beforeId, beforeDateTime, afterId, afterDateTime } = cursors;

    const result = await dataFetchFn(
      linkId,
      {
        limit: pageSize ?? config.defaultPageLimit,
        beforeId,
        beforeDateTime,
        afterId,
        afterDateTime,
      },
      ctx
    );

    if (result === null) {
      return result;
    }

    return processListResponses.processListResponse({
      result,
      dataTransformFn,
      req,
      pageSize,
      hasBeforeCursor: !!beforeCursor,
      basePath,
      linkId,
    });
  };

  // queries a top-level resource by UUID+DateTime pagination (not linked/nested).
  const listQueryFetchByIdDateTime = async <TIn, TOut>(
    dataFetchFn: ListDateTimeQueryFetchFn<TIn>,
    dataTransformFn: ListDataTransformFn<TIn, TOut>,
    req: AuthenticatedRequest,
    basePath = config.basePath
  ): Promise<{ data: TOut; pageInfo: QueryMetaDataResponse }> => {
    const { beforeCursor, afterCursor, pageSize } = req.listQueryOptions ?? {};
    const ctx = buildCtx(req);

    const cursors = parseUuidDateTimeCursors(beforeCursor, afterCursor);
    if (cursors === null) {
      throw createHttpError(400, 'Incorrect cursor provided in query');
    }

    const { beforeId, beforeDateTime, afterId, afterDateTime } = cursors;

    const result = await dataFetchFn(
      {
        limit: pageSize ?? config.defaultPageLimit,
        beforeId,
        beforeDateTime,
        afterId,
        afterDateTime,
      },
      ctx
    );

    return processListResponses.processListResponse({
      result,
      dataTransformFn,
      req,
      pageSize,
      hasBeforeCursor: !!beforeCursor,
      basePath,
    });
  };

  return {
    listQueryFetch,
    linkedListQueryFetch,
    linkedListQueryFetchByIdDateTime,
    listQueryFetchByIdDateTime,
  };
};

export type QueryListRequests = ReturnType<typeof queryListRequests>;
