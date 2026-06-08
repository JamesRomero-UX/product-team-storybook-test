import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getIndicatorByIdQueryConfig,
  getIndicatorListQueryConfig,
  getIndicatorResultByIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/indicator.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  LinkedListQueryByUuidTs,
  ListQueryBySeqId,
} from '../../routers/backend/query.schema';
import type {
  IndicatorListResponse,
  IndicatorResultListResponse,
} from '../../types/backend/v1/list.types';
import {
  computePageAndMeta,
  computePageAndMetaCompound,
  sequentialIdPaginationConfig,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  IndicatorBackendService,
} from '../service.types';

export class IndicatorServiceImpl implements IndicatorBackendService {
  async getIndicatorList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<IndicatorListResponse> {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts || {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    const data = await db.org((tx) => {
      return tx.query.indicator.findMany({
        ...getIndicatorListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, indicator: page };
  }
  async getIndicatorById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, indicatorData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Indicator,
          },
        }),
        tx.query.indicator.findFirst({
          where: { Id: id },
          ...getIndicatorByIdQueryConfig,
        }),
      ]);

      return indicatorData
        ? { indicator: indicatorData, form_configuration: formConfig ?? null }
        : null;
    });
  }

  async getIndicatorResultList(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<IndicatorResultListResponse> {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);
    const { linkId } = opts;

    const data = await db.org(async (tx) => {
      return tx.query.indicator_result.findMany({
        where: {
          ...listPagination.queryConfig.where,
          parent: { Id: linkId },
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getIndicatorResultByIdQueryConfig,
      });
    });

    const { page, metadata } = computePageAndMetaCompound(
      {
        beforeId: opts.beforeId ?? null,
        beforeDateTime: opts.beforeDateTime ?? null,
        afterId: opts.afterId ?? null,
        afterDateTime: opts.afterDateTime ?? null,
      },
      data,
      listPagination.limit,
      'Id',
      'CreatedAtTimestamp'
    );

    return {
      pageMetadata: metadata,
      indicatorResult: page,
    };
  }

  async getIndicatorResultById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, indicatorResultData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.IndicatorResult,
          },
        }),
        tx.query.indicator_result.findFirst({
          where: { Id: id },
          ...getIndicatorResultByIdQueryConfig,
        }),
      ]);

      return indicatorResultData
        ? {
            indicatorResult: indicatorResultData,
            form_configuration: formConfig ?? null,
          }
        : null;
    });
  }
}
