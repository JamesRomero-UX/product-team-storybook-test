import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getObligationByIdQueryConfig,
  getObligationListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/obligation.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type { ListQueryBySeqId } from '../../routers/backend/query.schema';
import type { ObligationListResponse } from '../../types/backend/v1/list.types';
import {
  computePageAndMeta,
  sequentialIdPaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  ObligationBackendService,
} from '../service.types';

export class ObligationServiceImpl implements ObligationBackendService {
  async getObligationList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ObligationListResponse> {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts || {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    const data = await db.org((tx) => {
      return tx.query.obligation.findMany({
        ...getObligationListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, obligation: page };
  }
  async getObligationById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, obligationData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Obligation,
          },
        }),
        tx.query.obligation.findFirst({
          where: { Id: id },
          ...getObligationByIdQueryConfig,
        }),
      ]);

      return obligationData
        ? { obligation: obligationData, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
