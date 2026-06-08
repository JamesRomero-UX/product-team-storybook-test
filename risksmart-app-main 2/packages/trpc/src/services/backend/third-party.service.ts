import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getThirdPartyQueryConfig } from '@risksmart-app/drizzle/src/queries/third-party.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type { ListQueryBySeqId } from '../../routers/backend/query.schema';
import type { ThirdPartyListResponse } from '../../types/backend/v1/list.types';
import {
  computePageAndMeta,
  sequentialIdPaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  ThirdPartyBackendService,
} from '../service.types';

export class ThirdPartyServiceImpl implements ThirdPartyBackendService {
  async getThirdPartyList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ThirdPartyListResponse> {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts || {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    const data = await db.org((tx) => {
      return tx.query.third_party.findMany({
        ...getThirdPartyQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, thirdParty: page };
  }

  async getThirdPartyById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, thirdPartyData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.ThirdParty,
          },
        }),
        tx.query.third_party.findFirst({
          where: { Id: id },
          ...getThirdPartyQueryConfig,
        }),
      ]);

      return thirdPartyData
        ? { thirdParty: thirdPartyData, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
