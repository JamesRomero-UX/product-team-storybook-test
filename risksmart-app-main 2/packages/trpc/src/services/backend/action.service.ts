import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getActionByIdQueryConfig,
  getActionListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/action.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  LinkedListQueryBySeqId,
  ListQueryBySeqId,
} from '../../routers/backend/query.schema';
import type { ActionListResponse } from '../../types/backend/v1/list.types';
import {
  computePageAndMeta,
  sequentialIdPaginationConfig,
} from '../../utils/pagination';
import type {
  ActionBackendService,
  BackendServiceContext,
} from '../service.types';

export class ActionServiceImpl implements ActionBackendService {
  async getActionsByParent(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ) {
    const { linkId } = opts;
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org(async (tx) => {
      return tx.query.action.findMany({
        ...getActionListQueryConfig,
        where: {
          parents: { ParentId: linkId },
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
      action: page,
    };
  }
  async getActionList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ActionListResponse> {
    const { db, beforeSequentialId, afterSequentialId, listPagination } =
      await this.setupQuery(ctx, opts);

    const data = await db.org((tx) => {
      return tx.query.action.findMany({
        ...getActionListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return { pageMetadata: metadata, action: page };
  }
  async getActionById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, actionData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Action,
          },
        }),
        tx.query.action.findFirst({
          where: { Id: id },
          ...getActionByIdQueryConfig,
        }),
      ]);

      return actionData
        ? { action: actionData, form_configuration: formConfig ?? null }
        : null;
    });
  }

  private async setupQuery(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId | LinkedListQueryBySeqId
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts ?? {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    return { db, beforeSequentialId, afterSequentialId, listPagination };
  }
}
