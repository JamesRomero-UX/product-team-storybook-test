import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getEnterpriseRiskByIdQueryConfig,
  getEnterpriseRiskListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/enterprise-risk.query';
import { getRiskListQueryConfig } from '@risksmart-app/drizzle/src/queries/risk.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  LinkedListQueryBySeqId,
  ListQueryBySeqId,
} from '../../routers/backend/query.schema';
import type { EnterpriseRiskListResponse } from '../../types/backend/v1/list.types';
import {
  computePageAndMeta,
  sequentialIdPaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  EnterpriseRiskBackendService,
} from '../service.types';

export class EnterpriseRiskServiceImpl implements EnterpriseRiskBackendService {
  async getEnterpriseRiskList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<EnterpriseRiskListResponse> {
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org((tx) => {
      return tx.query.enterprise_risk.findMany({
        ...getEnterpriseRiskListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, enterpriseRisk: page };
  }

  async getEnterpriseRiskById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, enterpriseRiskData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.EnterpriseRisk,
          },
        }),
        tx.query.enterprise_risk.findFirst({
          where: { Id: id },
          ...getEnterpriseRiskByIdQueryConfig,
        }),
      ]);

      return enterpriseRiskData
        ? {
            enterpriseRisk: enterpriseRiskData,
            form_configuration: formConfig ?? null,
          }
        : null;
    });
  }

  async getEnterpriseRiskChildRisks(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ) {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org((tx) => {
      return tx.query.risk.findMany({
        ...getRiskListQueryConfig,
        where: {
          enterpriseRiskInstance: { EnterpriseRiskId: linkId },
          ...listPagination.queryConfig.where,
        },
        orderBy: listPagination.queryConfig.orderBy,
        limit: listPagination.queryConfig.limit,
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
      risk: page,
    };
  }

  private async setupQuery(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId | LinkedListQueryBySeqId
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts || {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    return { db, beforeSequentialId, afterSequentialId, listPagination };
  }
}
