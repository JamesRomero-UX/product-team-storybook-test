import type {
  IClient,
  IndicatorListQueryResponse,
  IndicatorResultListQueryResponse,
} from '../../clients/client.interface';
import type {
  LinkedListIdDateTimeQueryFetchFn,
  ListQueryFetchFn,
  ServiceCallContext,
} from '../../types/service';
import { logger } from '../../utils/logger';

export type IndicatorsService = ReturnType<typeof indicatorsService>;

export function indicatorsService(client: IClient) {
  const getIndicators: ListQueryFetchFn<
    IndicatorListQueryResponse['indicator']
  > = async (query, ctx) => {
    const response = await client.queryIndicatorList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.indicator, metadata: response.pageMetadata };
  };
  const getIndicatorById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getIndicatorById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { indicator, form_configuration } = response;

    return { data: indicator, form_configuration };
  };

  const getIndicatorResults: LinkedListIdDateTimeQueryFetchFn<
    IndicatorResultListQueryResponse['indicatorResult']
  > = async (linkId, query, ctx) => {
    const response = await client.queryIndicatorResultList(
      { authorization: ctx.authToken },
      {
        linkId,
        limit: query.limit,
        afterId: query.afterId,
        afterDateTime: query.afterDateTime,
        beforeId: query.beforeId,
        beforeDateTime: query.beforeDateTime,
      }
    );

    return { data: response.indicatorResult, metadata: response.pageMetadata };
  };

  const getIndicatorResultById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { id: indicatorId, resultId } = ids;
    if (!indicatorId || !resultId) {
      return null;
    }
    const response = await client.getIndicatorResultById(
      { authorization: ctx.authToken },
      resultId
    );
    if (response === null) {
      return null;
    }
    const { indicatorResult, form_configuration } = response;

    if (indicatorResult.parent?.Id !== indicatorId) {
      logger.warn(
        { indicatorId, resultId, parentId: indicatorResult.parent?.Id },
        'result exists but not found under indicator'
      );

      return null;
    }

    return { data: indicatorResult, form_configuration };
  };

  return {
    getIndicators,
    getIndicatorById,
    getIndicatorResults,
    getIndicatorResultById,
  };
}
