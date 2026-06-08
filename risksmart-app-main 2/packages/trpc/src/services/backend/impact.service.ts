import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getImpactQueryConfig } from '@risksmart-app/drizzle/src/queries/impact.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type { ListQueryBySeqId } from '../../routers/backend/query.schema';
import type { ImpactByIdResponse } from '../../types/backend/v1/impact.types';
import {
  computePageAndMeta,
  sequentialIdPaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  ImpactBackendService,
} from '../service.types';

export class ImpactServiceImpl implements ImpactBackendService {
  async getImpactList(ctx: BackendServiceContext, opts: ListQueryBySeqId) {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts || {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    const data = await db.org((tx) => {
      return tx.query.impact.findMany({
        ...getImpactQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return {
      pageMetadata: metadata,
      impact: page,
    };
  }

  async getImpactById(
    ctx: BackendServiceContext,
    impactId: string
  ): Promise<ImpactByIdResponse | null> {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Impact,
          },
        }),
        tx.query.impact.findFirst({
          where: { Id: impactId },
          ...getImpactQueryConfig,
        }),
      ]);

      return data
        ? { impact: data, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
