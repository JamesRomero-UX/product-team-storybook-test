import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getLinkItemsListConfig } from '@risksmart-app/drizzle/src/queries/linked-item.query';

import type { LinkedListQueryByUuidTs } from '../../routers/backend/query.schema';
import {
  computePageAndMetaCompound,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  LinkedItemBackendService,
} from '../service.types';

export class LinkedItemServiceImpl implements LinkedItemBackendService {
  async getLinkedItemList(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);
    const { linkId } = opts;

    const data = await db.org(async (tx) => {
      return tx.query.linked_item.findMany({
        where: {
          ...listPagination.queryConfig.where,
          Source: linkId,
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getLinkItemsListConfig,
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
      linkedItem: page,
    };
  }
}
